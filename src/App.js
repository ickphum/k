import React, { useRef, useState, useEffect, useCallback  } from "react";

import './App.css';
import data from './data.json';

const FAVORITE_FILES = "ikmreader_favoriteFiles";
const FAVORITE_AUTHORS = "ikmreader_favoriteAuthors";
const HISTORY = "ikmreader_history";

// eslint-disable-next-line max-statements
const App = () => {

    const [ nameFilter, setNameFilter ] = useState( "" );
    const [ authorFilter, setAuthorFilter ] = useState( "" );
    const [ author, setAuthor ] = useState( "" );
    const [ minSize, setMinSize ] = useState( 0 );
    const [ selectedTags, setSelectedTags ] = useState([]);
    const [ file, setFile ] = useState( '' );
    const [ html, setHtml ] = useState( '' );
    const [ showTags, setShowTags ] = useState( 0 );
    const [ showFavoriteStories, setShowFavoriteStories ] = useState( 0 );
    const [ showFavoriteAuthors, setShowFavoriteAuthors ] = useState( 0 );
    const [ showHistory, setShowHistory ] = useState( 0 );
    const htmlRef = useRef( null );
    const scrollFlagRef = useRef( false );
    const scrollRAFRef = useRef( null );
    const scrollCounterRef = useRef( 0 );
    const [ scrollSpeed, setScrollSpeed ] = useState( 0 );


    const [ favoriteFiles, setFavoriteFiles ] = useState( () => {
        // getting stored value
        const saved = localStorage.getItem( FAVORITE_FILES );
        const initialValue = JSON.parse( saved );
        return initialValue || [];
    });

    useEffect( () => {
        localStorage.setItem( FAVORITE_FILES, JSON.stringify( favoriteFiles ) );
    }, [ favoriteFiles ]);

    const toggleFavoriteFile = file => {
        if ( favoriteFiles.find( f => f.path === file.path ) ) {
            setFavoriteFiles([ ...favoriteFiles.filter( f => f.path !== file.path )  ]);
            reset();
        }
        else
            setFavoriteFiles([ ...favoriteFiles, file ]);
    };

    const fileIsFavorite = file && favoriteFiles.find( f => f.path === file );


    const [ favoriteAuthors, setFavoriteAuthors ] = useState( () => {
        const saved = localStorage.getItem( FAVORITE_AUTHORS );
        const initialValue = JSON.parse( saved );
        return initialValue || [];
    });

    useEffect( () => {
        localStorage.setItem( FAVORITE_AUTHORS, JSON.stringify( favoriteAuthors ) );
    }, [ favoriteAuthors ]);

    const toggleFavoriteAuthor = author => {
        if ( favoriteAuthors.find( a => a === author ) ) {
            setFavoriteAuthors([ ...favoriteAuthors.filter( a => a !== author )  ]);
            reset();
        }
        else
            setFavoriteAuthors([ ...favoriteAuthors, author ]);
    };


    const [ history, setHistory ] = useState( () => {
        const saved = localStorage.getItem( HISTORY );
        const initialValue = JSON.parse( saved );
        // console.log( 'history loaded', initialValue );
        return initialValue || [];
    });

    useEffect( () => {
        localStorage.setItem( HISTORY, JSON.stringify( history ) );
    }, [ history ]);

    const addHistoryFile = file => {
        // console.log( 'add history file', file, history, history.find( f => f === file ) );
        setHistory( history => {
            return history.find( f => f === file )
                ? history
                : [ ...history, file ];
        });
    };


    const authorIsFavorite = author && favoriteAuthors.find( a => a === author );

    const addTag = tag => {
        setSelectedTags([ ...selectedTags, tag ]);
    };

    const removeTag = deadTag => {
        setSelectedTags( selectedTags.filter( tag => tag !== deadTag ) );
    };

    const intersect = ( a, b ) => {
        var setB = new Set( b );
        return [ ...new Set( a ) ].filter( x => setB.has( x ) );
    };

    // if we have selected tags, the list of tags we display is the full list filtered into
    // all the tags who appear with the selected tags.
    const validTags = () => {
        return selectedTags.reduce( ( acc, cur ) => {
            return intersect( acc, Object.keys( data.tag[ cur ].otherTags ) );
        }, Object.keys( data.tag ) );
    };

    const availableTags = selectedTags.length
        ? validTags()
        : Object.keys( data.tag );

    const fileHasAllTags = ( file, tags ) => tags.length === 0 || tags.every( t => data.file[ file ].tags[ t ]);
    // const fileHasSomeTags = ( ft, tags ) => tags.length === 0 || tags.some( t => data.file[ ft ].tags[ t ]);

    const matches = selectedTags.length || nameFilter || authorFilter || minSize > 9999
        ? Object.keys( data.file ).filter( file => ( ( !nameFilter || ( new RegExp( nameFilter, 'i' ).test( file ) ) ) &&
            ( !authorFilter || ( new RegExp( authorFilter, 'i' ).test( data.file[ file ].author ) ) ) &&
            ( selectedTags.length === 0 || fileHasAllTags( file, selectedTags ) ) &&
            ( !minSize || minSize < 9999 || data.file[ file ].size > minSize ) ) )
        : [];

    const authors = authorFilter
        ? Object.keys( data.author ).filter( author => ( new RegExp( authorFilter, 'i' ).test( author ) ) )
        : [];

    const reset = () => {
        setFile( void 0 );
        setAuthor( void 0 );
        if ( htmlRef.current )
            htmlRef.current.scrollTop = 0;
    };

    const openFile = file => {

        fetch( `html${file}` )
            .then( r => r.text() )
            .then( t => t.replaceAll( "�", "'" ) )
            .then( t => setHtml( t ) )
            .then( () => htmlRef.current.scrollTop = 0 );
        setFile( file );
        setAuthor( void 0 );
        addHistoryFile( file );
        // htmlRef.current.scrollTop = 0;

    };

    const shortSize = size => String( size >> 10 ) + 'k';

    const scroll = useCallback( () => {
        if ( scrollFlagRef.current && htmlRef.current ) {
            if ( scrollCounterRef.current >= scrollSpeed ) {
                htmlRef.current.scrollTop += 1;
                scrollCounterRef.current = 0;
            }
            else
                scrollCounterRef.current++;
        }
        scrollRAFRef.current = requestAnimationFrame( scroll );
    }, [ scrollSpeed ]);

    const jump = e => {
        const topQuarter = htmlRef.current.clientHeight * 0.25;
        const bottomQuarter = htmlRef.current.clientHeight * 0.75;
        if ( e.clientY < topQuarter )
            htmlRef.current.scrollTop -= htmlRef.current.clientHeight - 20;
        if ( e.clientY > bottomQuarter )
            htmlRef.current.scrollTop += htmlRef.current.clientHeight - 20;
    };

    useEffect( () => {
        // console.log( 'add fake history'  );
        window.history.pushState( null, document.title, window.location.href );
        window.addEventListener( 'popstate', function() {
            // console.log( 'popstate'  );
            window.history.pushState( null, document.title,  window.location.href );
            reset();
        });
    }, []);

    useEffect( () => {
        if ( scrollRAFRef.current )
            cancelAnimationFrame( scrollRAFRef.current );
        scrollRAFRef.current = requestAnimationFrame( scroll );
    }, [ scroll ]);

    // map max - 0 into 0 - 255
    const hueRange = ( value, max ) => Math.max( max - value, 0 ) * 255 / max;

    const fileColor = file => ( `hsl(${hueRange( data.file[ file ].size, 250000 )}, 100%, 90%)` );
    const tagColor = tag => ( `hsl(${hueRange( data.tag[ tag ].count, 2048 )}, 100%, 90%)` );
    const authorColor = author => ( `hsl(${hueRange( data.author[ author ].files.length, 10 )}, 100%, 90%)` );

    const FileList = ({ files, tags, label = "Stories:", sortFunction = ( a, b ) => data.file[ b ].size - data.file[ a ].size }) => (
        <div>
            {label}
            {files
                .filter( ( v, i ) => data.file[ v ] && i < 100 )
                .sort( sortFunction )
                .map( file => <button style={{ backgroundColor: fileColor( file ) }} className="fileButton" key={file} onClick={() => openFile( file )}>
                    {data.file[ file ].title}
                    &nbsp;
                    {shortSize( data.file[ file ].size )}
                    &nbsp;
                    {tags && Object.keys( data.file[ file ].tags ).join( ' ' )}
                </button>
                )
            }
        </div>
    );

    const TagList = ({ tags }) => tags.sort( ( a, b ) => data.tag[ b ].count - data.tag[ a ].count )
        .filter( ( v, i ) => showTags === 2 || i < 150 )
        .map( tag => <button style={{ backgroundColor: tagColor( tag ) }} className="tagButton" type="button" key={tag} onClick={() => addTag( tag )} >{tag}</button> );

    const AuthorList = ({ authors }) => authors?.length ? <div>
        {authors
            .sort( ( a, b ) => data.author[ b ].files.length - data.author[ a ].files.length )
            .filter( ( a, i ) => i < 50 )
            .map( author => <button
                style={{ backgroundColor: authorColor( author ) }}
                key={author}
                onClick={() => setAuthor( author )}>{author} {data.author[ author ].files.length}
            </button> )}
    </div> : null;

    if ( file )
        console.log( 'file', data.file[ file ]);

    if ( author )
        console.log( 'author', author, data.author[ author ] );

    return (
        <div style={{ display: "flex", flexDirection: 'column' }}>
            {author ? <>
                <div className="topButtons" >
                    <button className={`tagButton ${authorIsFavorite ? 'selected' : ''}`} onClick={() => {
                        toggleFavoriteAuthor( author );
                    }}
                    >
                        {author}
                    </button>
                    <button onClick={() => setAuthor( void 0 )}>Back</button>
                    <button onClick={() => reset()}>Main</button>
                </div>
                <FileList files={data.author[ author ]?.files} tags />
            </>

                : file
                    ? <>
                        <div className="topButtons" >
                            <button className={`tagButton ${fileIsFavorite ? 'selected' : ''}`} onClick={() => {
                                toggleFavoriteFile( data.file[ file ]);
                            }}
                            >
                                {data.file[ file ]?.title}
                            </button>
                            <button onClick={() => {
                                setAuthor( data.file[ file ].author );
                                htmlRef.current.scrollTop = 0;
                            }}>{data.file[ file ]?.author}</button>
                            <button onClick={() => reset()}>Main</button>
                            <button onClick={() => setScrollSpeed( scrollSpeed + 1 )}>Slower</button>
                            {scrollSpeed}
                            <button onClick={() => {
                                if ( scrollSpeed > 0 ) setScrollSpeed( scrollSpeed - 1 ); }
                            }>Faster</button>
                        </div>
                        <div
                            ref={htmlRef}
                            className="htmlContent"
                            onDoubleClick={e => {
                                const topQuarter = htmlRef.current.clientHeight * 0.25;
                                const bottomQuarter = htmlRef.current.clientHeight * 0.75;
                                if ( e.clientY > topQuarter && e.clientY < bottomQuarter )
                                    scrollFlagRef.current = !scrollFlagRef.current;
                            }}
                            onClick={jump}
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    </>
                    : <>
                        <div>Title: <input type="text" value={nameFilter} onChange={e => setNameFilter( e.target.value )}/></div>
                        <div>Author: <input type="text" value={authorFilter} onChange={e => setAuthorFilter( e.target.value )}/></div>
                        <AuthorList authors={authors} />

                        <div>Min Size: <input type="number" onChange={e => setMinSize( Number( e.target.value ) )}/></div>
                        <div className="tagSelector">
                            {selectedTags.length ? "Tags:" : ""}
                            {selectedTags.map( tag =>
                                <button className={"tagButton selected"} type="button" key={tag} onClick={() => removeTag( tag )} >{tag}</button> )}
                        </div>
                        <div className="tagSelector">
                            <button onClick={() => setShowTags( ( showTags + 1 ) % 3 )}>Pick Tags</button>
                            {showTags > 0 && <TagList tags={availableTags} /> }
                        </div>
                        <div className="tagSelector">
                            <button onClick={() => setShowFavoriteStories( ( showFavoriteStories + 1 ) % 2 )}>Favorites</button>
                            { showFavoriteStories > 0 && favoriteFiles.length > 0 ? <FileList files={favoriteFiles.map( f => f.path )} label="" /> : null}
                        </div>
                        <div className="tagSelector">
                            <button onClick={() => setShowFavoriteAuthors( ( showFavoriteAuthors + 1 ) % 2 )}>Favorite Authors</button>
                            { showFavoriteAuthors > 0 && <AuthorList authors={favoriteAuthors} />}
                        </div>
                        <div className="tagSelector">
                            <button onClick={() => setShowHistory( ( showHistory + 1 ) % 2 )}>History</button>
                            { showHistory > 0 && history.length > 0 ? <>
                                {/* <button onClick={() => setHistory([])}>Clear</button> */}
                                <FileList files={history} label="" sortFunction={() => -1} />
                            </> : null}
                        </div>
                        <FileList files={matches} />
                    </>
            }


            {/* <button type="button" onClick={() => console.log( 'click', nameFilter, minSize )} >Search</button> */}
        </div>
    );
};

export default App;

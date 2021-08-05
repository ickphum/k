import React, { useRef, useState, useEffect  } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import * as THREE from "three";
import Optimer from './fonts/optimer_regular.typeface.json';

import './App.css';

const font = new THREE.FontLoader().parse( Optimer );

const makePairs = ( count1, count2 ) => {

    const pairs = [];

    if ( count1 && count2 ) {
        const increment1 = count1 > 1 ? 2 / ( count1 - 1 ) : 0;
        const increment2 = count2 > 1 ? 2 / ( count2 - 1 ) : 0;
        for ( let y = 0; y < count1; y++ ) {
            for ( let z = 0; z < count2; z++ )
                pairs.push([ -1 + y * increment1, -1 + z * increment2 ]);

        }
    }
    return pairs;
};

const Box = ( props ) => {
    // This reference will give us direct access to the mesh
    const group = useRef();
    const {
        xSettings,
        ySettings,
        zSettings,
        dim
    } = props;

    // Rotate mesh every frame, this is outside of React without overhead
    useFrame( () => {
        // group.current.rotation.x = group.current.rotation.y += rotate;
        // group.current.rotation.x += rotate;
    });

    const size = 1;

    const textOptions = {
        font,
        size:   5,
        height: 1
    };


    const xPairs = makePairs( xSettings.axis1Count, xSettings.axis2Count );
    const yPairs = makePairs( ySettings.axis1Count, ySettings.axis2Count );
    const zPairs = makePairs( zSettings.axis1Count, zSettings.axis2Count );


    return (
        <group ref={group} {...props}>

            {xPairs.map( ( pair ) => {
                return <mesh onClick={() => console.log( 'X', pair  )} position={[ 0, pair[ 0 ] * dim / 2, pair[ 1 ] * dim / 2  ]}>
                    <boxBufferGeometry args={[ dim, size, size  ]} />
                    <meshStandardMaterial
                        attach="material"
                        color={0xff0000}
                    />
                </mesh>;
            })}
            {yPairs.map( ( pair ) => {
                return <mesh position={[ pair[ 0 ] * dim / 2, 0, pair[ 1 ] * dim / 2 ]}>
                    <boxBufferGeometry args={[ size, dim, size  ]} />
                    <meshStandardMaterial
                        attach="material"
                        color={0x00ff00}
                    />
                </mesh>;
            })}
            {zPairs.map( ( pair ) => {
                return <mesh position={[ pair[ 0 ] * dim / 2, pair[ 1 ] * dim / 2, 0 ]}>
                    <boxBufferGeometry args={[ size, size, dim  ]} />
                    <meshStandardMaterial
                        attach="material"
                        color={0x0000ff}
                    />
                </mesh>;
            })}

            {/* axes */}
            <mesh position={[ 0, 0, 0 ]}>
                <boxBufferGeometry args={[ dim, 0.1, 0.1 ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0xff0000}
                />

            </mesh>
            <mesh position={[ dim / 2, -textOptions.size / 2, 0 ]}>
                <textGeometry attach='geometry' args={[ 'X', textOptions ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0xff0000}
                />
            </mesh>

            <mesh position={[ 0, 0, 0 ]}>
                <boxBufferGeometry args={[ 0.1, dim, 0.1 ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0x00ff00}
                />
            </mesh>
            <mesh position={[ -textOptions.size / 2, dim / 2, 0 ]}>
                <textGeometry attach='geometry' args={[ 'Y', textOptions ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0x00ff00}
                />
            </mesh>

            <mesh position={[ 0, 0, 0 ]}>
                <boxBufferGeometry args={[  0.1, 0.1, dim ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0x0000ff}
                />
            </mesh>

            <mesh position={[ 0, 0, 0 ]}>
                <boxBufferGeometry args={[ dim / 10, 1, 1 ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0xff0000}
                />
            </mesh>
            <mesh position={[ 0, 0, 0 ]}>
                <boxBufferGeometry args={[ 1, dim / 10, 1 ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0x00ff00}
                />
            </mesh>
            <mesh position={[ 0, 0, 0 ]}>
                <boxBufferGeometry args={[  1, 1, dim / 10 ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0x0000ff}
                />
            </mesh>
        </group>
    );
};

const SettingButton = props => {
    const {
        value,
        increment,
        factor,
        min,
        max,
        places = 2
    } = props;
    return <span
        className="button"
        onClick={e => {
            const newValue = increment
                ? e.shiftKey ? value - increment : value + increment
                : e.shiftKey
                    ? Math.abs( value ) < 0.00001 ? 0 : value / factor
                    : Math.abs( value ) < 0.00001 ? 0.00001 : value * factor;
            if ( ( max === undefined || newValue <= max ) && ( min === undefined || newValue >= min ) )
                props.setter( Math.round( newValue * 1000000 ) / 1000000 );
        }}>
        {props.label} = {Number( props.value ).toFixed( places )}
    </span>;
};

const AxisSettings = props => {
    const {
        label,
        axis1,
        axis2,
        settings,
        setter
    } = props;
    return <>
        <div style={{ background: "transparent", marginBottom: 5, marginTop: 5 }}>
            {label}
        </div>
        <div style={{ background: "transparent" }}>
            <SettingButton
                label={axis1}
                value={settings.axis1Count}
                increment={1}
                setter={v => setter({ ...settings, axis1Count: v })}
                min={1}
                places={0}
            />
            <SettingButton
                label={axis2}
                value={settings.axis2Count}
                increment={1}
                setter={v => setter({ ...settings, axis2Count: v })}
                min={1}
                places={0}
            />
        </div>
    </>;

};

const calculateCameraZ = ( fov, size ) => Math.cos( ( fov / 2 ) * Math.PI / 180 ) * ( ( size * 2 ) / Math.sin( ( fov / 2 ) * Math.PI / 180 ) );

const bounded = ( value, lower, upper ) => Math.max( lower, Math.min( upper, value ) );

const App = () => {
    const [ fov, setFov ] = useState( 70 );
    const [ rotX, setRotX ] = useState( 0 );
    const [ rotY, setRotY ] = useState( 0 );
    const [ rotZ, setRotZ ] = useState( 0 );
    const [ dim, setDim ] = useState( 100 );
    const [ cameraZ, setCameraZ ] = useState( calculateCameraZ( fov, dim ) );
    const [ dimensions, setDimensions ] = useState({
        height: window.innerHeight,
        width:  window.innerWidth
    });
    const [ rotating, setRotating ] = useState( false );
    const [ xSettings, setXSettings ] = useState({
        axis1Count: 2,
        axis2Count: 2
    });
    const [ ySettings, setYSettings ] = useState({
        axis1Count: 2,
        axis2Count: 2
    });
    const [ zSettings, setZSettings ] = useState({
        axis1Count: 2,
        axis2Count: 2
    });

    function Camera( props ) {
        const ref = useRef();
        const { setDefaultCamera } = useThree();

        // Make the camera known to the system
        useEffect( () => void setDefaultCamera( ref.current ), [ setDefaultCamera ]);

        // Update it every frame
        useFrame( () => {
            if ( ref.current )
                ref.current.updateMatrixWorld();
        });
        return <perspectiveCamera ref={ref} {...props} />;
    }


    useEffect( () => {
        function handleResize() {
            setDimensions({
                height: window.innerHeight,
                width:  window.innerWidth
            });
        }

        window.addEventListener( 'resize', handleResize );

        return () => {
            window.removeEventListener( 'resize', handleResize );
        };
    });

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: 'column' }}>
            <div
                className="button-panel"
            >
                <SettingButton label="RotX" value={rotX} increment={Math.PI / 8} setter={setRotX} />
                <SettingButton label="RotY" value={rotY} increment={Math.PI / 8} setter={setRotY} />
                <SettingButton label="RotZ" value={rotZ} increment={0.1} setter={setRotZ} />

                <SettingButton label="CZ" value={cameraZ} increment={20} setter={setCameraZ} />
                <SettingButton label="FOV" value={fov} increment={5} setter={setFov} places={0} />

                <SettingButton label="Dim" value={dim} increment={1} setter={setDim} places={0} />
                Window Size {dimensions.width}x{dimensions.height}

            </div>
            <div style={{ width: "100vw", height: "calc(100vh - 40px)", display: "flex", flexDirection: 'row' }}>
                <div style={{ background: "#ddd", padding: "10px", width: "20rem" }}>
                    <AxisSettings label="X Settings" axis1="Y Count" axis2="Z Count" settings={xSettings} setter={setXSettings} />
                    <AxisSettings label="Y Settings" axis1="X Count" axis2="Z Count" settings={ySettings} setter={setYSettings} />
                    <AxisSettings label="Z Settings" axis1="X Count" axis2="Y Count" settings={zSettings} setter={setZSettings} />
                </div>

                <Canvas
                    // onClick={( e ) => console.log( 'click', e.button, e.shiftKey )}
                    onContextMenu={( e ) => console.log( 'context menu' )}
                    onDoubleClick={( e ) => console.log( 'double click' )}
                    onWheel={( e ) => {
                        console.log( 'wheel spins', e.deltaY, e.shiftKey );
                        if ( e.shiftKey ) {
                            const newFov = bounded( fov + ( e.deltaY < 0 ? -5 : 5 ), 5, 180 );
                            console.log( 'newFov', newFov );
                            setCameraZ( calculateCameraZ( newFov, dim ) );
                            setFov( newFov );
                        }
                        else
                            setCameraZ( cameraZ + cameraZ * ( e.deltaY < 0 ? -( 1 / 11 ) : 0.1 ) );
                    }}
                    onPointerDown={( e ) => {
                        console.log( 'down', e.button, e.shiftKey );
                        // if ( e.shiftKey )
                        setRotating( true );
                    }}
                    onPointerUp={( e ) => {
                        console.log( 'up', e.button, e.shiftKey );
                        if ( rotating )
                            setRotating( false );
                    }}
                    onPointerOver={( e ) => console.log( 'over' )}
                    onPointerOut={( e ) => console.log( 'out' )}
                    onPointerEnter={( e ) => console.log( 'enter' )} // see note 1
                    onPointerLeave={( e ) => console.log( 'leave' )} // see note 1
                    onPointerMove={( e ) => {

                        // console.log( 'move', e.movementX, e.movementY, e.shiftKey );

                        // X and Y rotations are tracked in the range -2 to 2, which will then be multiplied
                        // by Pi, so that max rotation in either direction is all the way around but no further.
                        // Translate pixels to rotation by saying a full drag across the screen does a full
                        // rotation, ie changes rotation by 2, so dR = change/full * 2.
                        if ( rotating ) {
                            const newRotX = bounded( rotX + 2 * e.movementY / dimensions.height, -2, 2 );
                            const newRotY = bounded( rotY + 2 * e.movementX / dimensions.width, -2, 2 );
                            setRotX( newRotX );
                            setRotY( newRotY );
                        }
                    }}
                    onPointerMissed={() => console.log( 'missed' )}

                >
                    <Camera position={[ 0, 0, cameraZ ]} fov={fov} far={10000} />
                    <ambientLight intensity={0.5} />
                    <Box
                        position={[ 0, 0, 0 ]}
                        xSettings={xSettings}
                        ySettings={ySettings}
                        zSettings={zSettings}
                        rotation={[ rotX * Math.PI, rotY * Math.PI, rotZ ]}
                        dim={dim} />
                </Canvas>
            </div>
        </div>
    );
};

export default App;

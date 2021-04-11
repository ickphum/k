import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import * as THREE from "three";
import Optimer from './fonts/optimer_regular.typeface.json';

import './App.css';

const font = new THREE.FontLoader().parse( Optimer );

const Box = ( props ) => {
    // This reference will give us direct access to the mesh
    const group = useRef();
    const {
        xCount,
        rotate,
        dim
    } = props;

    // Rotate mesh every frame, this is outside of React without overhead
    useFrame( () => {
        // group.current.rotation.x = group.current.rotation.y += rotate;
        // group.current.rotation.x += rotate;
    });

    const size = 0.2;
    const size2 = 1;

    const textOptions = {
        font,
        size:   5,
        height: 1
    };

    return (
        <group ref={group} {...props}>

            {[ [ 1, 1 ], [ 1, -1 ], [ -1, 1 ], [ -1, -1 ] ].map( ( f, i ) => {
                return <group>
                    <mesh key={i} position={[ 0, f[ 0 ] * dim / 2, f[ 1 ] * dim / 2  ]}>
                        <boxBufferGeometry args={[ dim, size2, size2  ]} />
                        <meshStandardMaterial
                            attach="material"
                            color={0xff0000}
                        />
                    </mesh>;
                    <mesh position={[ f[ 0 ] * dim / 2, 0, f[ 1 ] * dim / 2 ]}>
                        <boxBufferGeometry args={[ size2, dim, size2 ]} />
                        <meshStandardMaterial
                            attach="material"
                            color={0x00ff00}
                        />
                    </mesh>
                    <mesh position={[ f[ 0 ] * dim / 2, f[ 1 ] * dim / 2, 0 ]}>
                        <boxBufferGeometry args={[ size2, size2, dim ]} />
                        <meshStandardMaterial
                            attach="material"
                            color={0x0000ff}
                        />
                    </mesh>
                </group>;
            })}

            {/* y axis */}
            {/* <mesh position={[ dim / 2, 0, dim / 2 ]}>
                <boxBufferGeometry args={[ size, dim, size ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0x000000}
                />
            </mesh>

            <mesh position={[ dim / 2, 0, -dim / 2 ]}>
                <boxBufferGeometry args={[ size, dim, size ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0x000000}
                />
            </mesh>

            <mesh position={[ -dim / 2, 0, dim / 2 ]}>
                <boxBufferGeometry args={[ size, dim, size ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0x000000}
                />
            </mesh>

            <mesh position={[ -dim / 2, 0, -dim / 2 ]}>
                <boxBufferGeometry args={[ size, dim, size ]} />
                <meshStandardMaterial
                    attach="material"
                    color={0x000000}
                />
            </mesh> */}

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

const Button = props => {
    const {
        value,
        increment,
        factor
    } = props;
    return <span
        className="button"
        onClick={e => {
            const newValue = increment
                ? e.shiftKey ? value - increment : value + increment
                : e.shiftKey
                    ? Math.abs( value ) < 0.00001 ? 0 : value / factor
                    : Math.abs( value ) < 0.00001 ? 0.00001 : value * factor;
            props.setter( Math.round( newValue * 1000000 ) / 1000000 );
        }}>
        {props.label} = {props.value}
    </span>;
};

const App = () => {
    const [ fov, setFov ] = useState( 70 );
    const [ xCount, setXCount ] = useState( 3 );
    const [ rotation, setRotation ] = useState( 0 );
    const [ rotX, setRotX ] = useState( 0.2 );
    const [ rotY, setRotY ] = useState( 0.4 );
    const [ rotZ, setRotZ ] = useState( 0 );
    const [ dim, setDim ] = useState( 100 );
    const [ cameraZ, setCameraZ ] = useState( 180 );


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

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: 'column' }}>
            <div
                className="button-panel"
            >
                Settings
                <Button label="R" value={rotation} factor={10} setter={setRotation} />

                <Button label="RotX" value={rotX} increment={0.1} setter={setRotX} />
                <Button label="RotY" value={rotY} increment={0.1} setter={setRotY} />
                <Button label="RotZ" value={rotZ} increment={0.1} setter={setRotZ} />

                <Button label="CZ" value={cameraZ} increment={20} setter={setCameraZ} />
                <Button label="FOV" value={fov} increment={5} setter={setFov} />

                <Button label="Dim" value={dim} increment={1} setter={setDim} />

            </div>
            <Canvas
                onClick={( e ) => console.log( 'click' )}
                onContextMenu={( e ) => console.log( 'context menu' )}
                onDoubleClick={( e ) => console.log( 'double click' )}
                onWheel={( e ) => console.log( 'wheel spins' )}
                onPointerUp={( e ) => console.log( 'up' )}
                onPointerDown={( e ) => console.log( 'down' )}
                onPointerOver={( e ) => console.log( 'over' )}
                onPointerOut={( e ) => console.log( 'out' )}
                onPointerEnter={( e ) => console.log( 'enter' )} // see note 1
                onPointerLeave={( e ) => console.log( 'leave' )} // see note 1
                onPointerMove={( e ) => console.log( 'move' )}
                onPointerMissed={() => console.log( 'missed' )}
                onUpdate={( self ) => console.log( 'props have been updated' )}
            >
                <Camera position={[ 0, 0, cameraZ ]} fov={fov} />
                <ambientLight intensity={0.5} />
                <Box position={[ 0, 0, 0 ]} xCount={xCount} rotate={rotation} rotation={[ rotX, rotY, rotZ ]} dim={dim} />
            </Canvas>
        </div>
    );
};

export default App;

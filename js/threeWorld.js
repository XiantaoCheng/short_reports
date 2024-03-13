/*

*/


// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var cube;

class Scene3D {
    constructor(ID='') {
        this.m_ID=ID;
        this.m_container='';
        this.m_scene='';
        this.m_camera='';
        this.m_render='';
        this.m_control='';
    }

    init(ID='') {
        if(ID!=="") {
            this.m_ID=ID;
            this.m_container = document.getElementById(this.m_ID);
        }
        else {
            this.m_container=document.body;
        }
        if(this.m_container===null) {
            this.m_container=document.body;
        }

        // SCENE
        this.m_scene = new THREE.Scene();
    
        // CAMERA
        var SCREEN_WIDTH = this.m_container.offsetWidth; 
        var SCREEN_HEIGHT = this.m_container.offsetHeight;
        var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
        this.m_camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.m_scene.add(this.m_camera);
        this.m_camera.position.set(0,150,400);
        this.m_camera.lookAt(this.m_scene.position);
        //this.m_camera.lookAt(new THREE.Vector3(0,600,0));
        //this.m_camera.lookAt(0,600,0);
    
        //RENDER
        this.m_renderer = new THREE.WebGLRenderer( {antialias:true} );
        this.m_renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        
        this.m_container.appendChild( this.m_renderer.domElement );
    
        // CONTROLS
        this.m_controls = new THREE.OrbitControls( this.m_camera, this.m_renderer.domElement );
        // LIGHT
        var light = new THREE.PointLight(0xffffff);
        light.position.set(0,150,100);
        this.m_scene.add(light);
    
        // FLOOR
        var floorTexture = new THREE.ImageUtils.loadTexture( 'https://stemkoski.github.io/Three.js/images/checkerboard.jpg' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
        floorTexture.repeat.set( 10, 10 );
        var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    
        var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -0.5;
        floor.rotation.x = Math.PI / 2;
        this.m_scene.add(floor);
    
        // SKYBOX/FOG
        var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
        var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
        var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        this.m_scene.add(skyBox);
    }

    update() {
        this.m_renderer.render( this.m_scene, this.m_camera );
        this.m_controls.update();
    }

    addBox(L,W,H,x,y,z) {
        var material = new THREE.MeshNormalMaterial();
        var cubeGeometry = new THREE.CubeGeometry( 1, 1, 1 );
        var cube = new THREE.Mesh( cubeGeometry, material );
        cube.position.set(x,y,z);
        cube.scale.x=L;
        cube.scale.y=W;
        cube.scale.z=H;
        this.m_scene.add( cube );
        return cube;
    }

    addCylinder(R,H,x,y,z) {
        var material = new THREE.MeshNormalMaterial();
        var geometry = new THREE.CylinderGeometry( 1,1,1,80,4 );
        var shape = new THREE.Mesh( geometry, material );
        shape.position.set(x, y, z);
        shape.scale.x=R;
        shape.scale.y=H;
        shape.scale.z=R;
        this.m_scene.add( shape );
        return shape;
    }

    addSphere(R,x,y,z) {
        var material = new THREE.MeshNormalMaterial();
        var geometry = new THREE.SphereGeometry( 1,32,16 );
        var shape = new THREE.Mesh( geometry, material );
        shape.scale.x=R;
        shape.scale.y=R;
        shape.scale.z=R;
        shape.position.set(x, y, z);
        this.m_scene.add( shape );
        return shape;
    }

    addExtrudePolygon(shx,shy,height,x,y,z) {
        const shape = new THREE.Shape();
        for (var i=0;i<shx.length;i++) {
            if(i==0) {
                shape.moveTo(shx[i],shy[i]);
            }
            else {
                shape.lineTo(shx[i],shy[i]);
            }
        }
        const extrudeSettings = {
        	steps: 2,
                amount: height,
        	bevelEnabled: false,
        };
        
        const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        const material = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh( geometry, material ) ;
        mesh.position.set(x,y,z);
        this.m_scene.add(mesh);
        
        return mesh;
    }

    setRotationByEuler(shape,alpha,beta,gamma) {
        shape.setRotationFromEuler(new THREE.Euler(0,0,0,'XYZ'));
        shape.rotateZ(alpha/180*Math.PI);
        shape.rotateX(beta/180*Math.PI);
        shape.rotateZ(gamma/180*Math.PI);
        return shape;
    }

    rotateInWorld(shape,pt,angle,axis='Z') {
        var T=new THREE.Matrix4().identity();
        T=T.multiply(new THREE.Matrix4().makeTranslation(pt[0],pt[1],pt[2]));
        if(axis==='X') {
            T=T.multiply(new THREE.Matrix4().makeRotationX(angle/180*Math.PI));
        }
        else if(axis==='Y') {
            T=T.multiply(new THREE.Matrix4().makeRotationY(angle/180*Math.PI));
        }
        else if(axis==='Z') {
            T=T.multiply(new THREE.Matrix4().makeRotationZ(angle/180*Math.PI));
        }
        T=T.multiply(new THREE.Matrix4().makeTranslation(-pt[0],-pt[1],-pt[2]));
        
        shape.updateMatrix();
        shape.applyMatrix(T);
        return shape;
    }

    lookAt_pt(shape,pt) {
        shape.lookAt(new THREE.Vector3(pt[0],pt[1],pt[2]));
        return shape;
    }

    lookAt(shape,shape0) {
        shape.lookAt(shape0.position);
        return shape;
    }

    cameraLookAt_pt(pt) {
        this.lookAt_pt(this.m_camera,pt);
        this.m_controls.center.x=pt[0];
        this.m_controls.center.y=pt[1];
        this.m_controls.center.z=pt[2];
    }

    cameraLookAt(shape) {
        this.lookAt(this.m_camera,shape);
        this.m_controls.center.x=shape.position.x;
        this.m_controls.center.y=shape.position.y;
        this.m_controls.center.z=shape.position.z;
    }

}

var world_3D=new Scene3D();

function animate_3D() {
    requestAnimationFrame(animate_3D);
    world_3D.update();
}

function printMatrix(matrix) {
    var list_val=matrix.elements;
    var str_line='';
    for(var i=0;i<4;i++) {
        for(var j=0;j<4;j++) {
            str_line+=`${list_val[j+i*4]}, `;
        }
        //print(str_line);
        str_line='';
    }
    //print();
}



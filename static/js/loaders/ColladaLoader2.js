/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.ColladaLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ColladaLoader.prototype = {

	constructor: THREE.ColladaLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var resourceDirectory = url.split( /[\\\/]/ );
		resourceDirectory.pop();
		resourceDirectory = resourceDirectory.join( '/' ) + '/';

		var loader = new THREE.FileLoader( scope.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text, resourceDirectory ) );

		}, onProgress, onError );

	},

	options: {

		set convertUpAxis( value ) {

			console.log( 'THREE.ColladaLoader.options.convertUpAxis: TODO' );

		}

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( text, resourceDirectory ) {

		function getElementsByTagName( xml, name ) {

			// Non recursive xml.getElementsByTagName() ...

			var array = [];
			var childNodes = xml.childNodes;

			for ( var i = 0, l = childNodes.length; i < l; i ++ ) {

				var child = childNodes[ i ];

				if ( child.nodeName === name ) {

					array.push( child );

				}

			}

			return array;

		}

		function parseStrings( text ) {

			if ( text.length === 0 ) return [];

			var parts = text.trim().split( /\s+/ );
			var array = new Array( parts.length );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parts[ i ];

			}

			return array;

		}

		function parseFloats( text ) {

			if ( text.length === 0 ) return [];

			var parts = text.trim().split( /\s+/ );
			var array = new Array( parts.length );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parseFloat( parts[ i ] );

			}

			return array;

		}

		function parseInts( text ) {

			if ( text.length === 0 ) return [];

			var parts = text.trim().split( /\s+/ );
			var array = new Array( parts.length );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parseInt( parts[ i ] );

			}

			return array;

		}

		function parseId( text ) {

			return text.substring( 1 );

		}

		function isEmpty( object ) {

			return  Object.keys( object ).length === 0;

		}

		// asset

		function parseAsset( xml ) {

			return {
				unit: parseAssetUnit( getElementsByTagName( xml, 'unit' )[ 0 ] ),
				upAxis: parseAssetUpAxis( getElementsByTagName( xml, 'up_axis' )[ 0 ] )
			};

		}

		function parseAssetUnit( xml ) {

			return xml !== undefined ? parseFloat( xml.getAttribute( 'meter' ) ) : 1;

		}

		function parseAssetUpAxis( xml ) {

			return xml !== undefined ? xml.textContent : 'Y_UP';

		}

		// library

		function parseLibrary( xml, libraryName, nodeName, parser ) {

			var library = getElementsByTagName( xml, libraryName )[ 0 ];

			if ( library !== undefined ) {

				var elements = getElementsByTagName( library, nodeName );

				for ( var i = 0; i < elements.length; i ++ ) {

					parser( elements[ i ] );

				}

			}

		}

		function buildLibrary( data, builder ) {

			for ( var name in data ) {

				var object = data[ name ];
				object.build = builder( data[ name ] );

			}

		}

		// get

		function getBuild( data, builder ) {

			if ( data.build !== undefined ) return data.build;

			data.build = builder( data );

			return data.build;

		}

		// animation

		function parseAnimation( xml ) {

			var data = {
				sources: {},
				samplers: {},
				channels: {}
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				var id;

				switch ( child.nodeName ) {

					case 'source':
						id = child.getAttribute( 'id' );
						data.sources[ id ] = parseSource( child );
						break;

					case 'sampler':
						id = child.getAttribute( 'id' );
						data.samplers[ id ] = parseAnimationSampler( child );
						break;

					case 'channel':
						id = child.getAttribute( 'target' );
						data.channels[ id ] = parseAnimationChannel( child );
						break;

					default:
						console.log( child );

				}

			}

			library.animations[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseAnimationSampler( xml ) {

			var data = {
				inputs: {},
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						var id = parseId( child.getAttribute( 'source' ) );
						var semantic = child.getAttribute( 'semantic' );
						data.inputs[ semantic ] = id;
						break;

				}

			}

			return data;

		}

		function parseAnimationChannel( xml ) {

			var data = {};

			var target = xml.getAttribute( 'target' );

			// parsing SID Addressing Syntax

			var parts = target.split( '/' );

			var id = parts.shift();
			var sid = parts.shift();

			// check selection syntax

			var arraySyntax = ( sid.indexOf( '(' ) !== - 1 );
			var memberSyntax = ( sid.indexOf( '.' ) !== - 1 );

			if ( memberSyntax ) {

				//  member selection access

				parts = sid.split( '.' );
				sid = parts.shift();
				data.member = parts.shift();

			} else if ( arraySyntax ) {

				// array-access syntax. can be used to express fields in one-dimensional vectors or two-dimensional matrices.

				var indices = sid.split( '(' );
				sid = indices.shift();

				for ( var i = 0; i < indices.length; i ++ ) {

					indices[ i ] = parseInt( indices[ i ].replace( /\)/, '' ) );

				}

				data.indices = indices;

			}

			data.id = id;
			data.sid = sid;

			data.arraySyntax = arraySyntax;
			data.memberSyntax = memberSyntax;

			data.sampler = parseId( xml.getAttribute( 'source' ) );

			return data;

		}

		function buildAnimation( data ) {

			var tracks = [];

			var channels = data.channels;
			var samplers = data.samplers;
			var sources = data.sources;

			for ( var target in channels ) {

				if ( channels.hasOwnProperty( target ) ) {

					var channel = channels[ target ];
					var sampler = samplers[ channel.sampler ];

					var inputId = sampler.inputs.INPUT;
					var outputId = sampler.inputs.OUTPUT;
					var interpolationId = sampler.inputs.INTERPOLATION;

					var inputSource = sources[ inputId ];
					var outputSource = sources[ outputId ];
					var interpolationSource = sources[ interpolationId ];

					var animation = buildAnimationChannel( channel, inputSource, outputSource, interpolationSource );

					createKeyframeTracks( animation, tracks );

				}

			}

			return tracks;

		}

		function getAnimation( id ) {

			return getBuild( library.animations[ id ], buildAnimation );

		}

		function buildAnimationChannel( channel, inputSource, outputSource, interpolationSource ) {

			var node = library.nodes[ channel.id ];
			var transform = node.transforms[ channel.sid ];
			var defaultMatrix = node.matrix.clone().transpose();

			var time, stride;
			var i, il, j, jl;

			var data = {};

			// the collada spec allows the animation of data in various ways.
			// depending on the transform type (matrix, translate, rotate, scale), we execute different logic

			switch ( transform ) {

				case 'matrix':

					for ( i = 0, il = inputSource.array.length; i < il; i ++ ) {

						time = inputSource.array[ i ];
						stride = i * outputSource.stride;

						if ( data[ time ] === undefined ) data[ time ] = {};

						if ( channel.arraySyntax === true ) {

							var value = outputSource.array[ stride ];
							var index = channel.indices[ 0 ] + 4 * channel.indices[ 1 ];

							data[ time ][ index ] = value;

						} else {

							for ( j = 0, jl = outputSource.stride; j < jl; j ++ ) {

								data[ time ][ j ] = outputSource.array[ stride + j ];

							}

						}

					}

					break;

				case 'translate':
					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
					break;

				case 'rotate':
					console.warn( 'THREE.ColladaLoader: Animation transform "%s" not yet implemented.', transform );
					break;

				case 'scale':
					console.warn( 'THREE.ColladaLoader: Animation transform "%s" not yet implemented.', transform );
					break;

			}

			keyframes = prepareAnimationData( data, defaultMatrix );

			var animation = {
				name: '.bones[' + node.sid + ']',
				keyframes: keyframes
			}

			return animation;

		}

		function prepareAnimationData( data, defaultMatrix ) {

			var keyframes = [];

			// transfer data into a sortable array

			for ( var time in data ) {

				keyframes.push( { time: parseFloat( time ), value: data[ time ] } );

			}

			// ensure keyframes are sorted by time

			keyframes.sort( ascending );

			// now we clean up all animation data, so we can use them for keyframe tracks

			for ( var i = 0; i < 16; i ++ ) {

				transformAnimationData( keyframes, i, defaultMatrix.elements[ i ] );

			}

			return keyframes;

			// array sort function

			function ascending( a, b ) {

				return a.time - b.time;

			}

		}

		var position = new THREE.Vector3();
		var scale = new THREE.Vector3();
		var quaternion = new THREE.Quaternion();

		function createKeyframeTracks( animation, tracks ) {

			var keyframes = animation.keyframes;
			var name = animation.name;

			var times = [];
			var positionData = [];
			var quaternionData = [];
			var scaleData = [];

			for ( var i = 0, l = keyframes.length; i < l; i ++ ) {

				var keyframe = keyframes[ i ];

				var time = keyframe.time;
				var value = keyframe.value;

				matrix.set(
					value[ 0 ], value[ 1 ], value[ 2 ], value[ 3 ],
					value[ 4 ], value[ 5 ], value[ 6 ], value[ 7 ],
					value[ 8 ], value[ 9 ], value[ 10 ], value[ 11 ],
					value[ 12 ], value[ 13 ], value[ 14 ], value[ 15 ]
				);

				matrix.decompose( position, quaternion, scale );

				times.push( time );
				positionData.push( position.x, position.y, position.z );
				quaternionData.push( quaternion.x, quaternion.y, quaternion.z, quaternion.w );
				scaleData.push( scale.x, scale.y, scale.z );

			}

			if ( positionData.length > 0 ) tracks.push( new THREE.VectorKeyframeTrack( name + '.position', times, positionData ) );
			if ( quaternionData.length > 0 ) tracks.push( new THREE.QuaternionKeyframeTrack( name + '.quaternion', times, quaternionData ) );
			if ( scaleData.length > 0 ) tracks.push( new THREE.VectorKeyframeTrack( name + '.scale', times, scaleData ) );

			return tracks;

		}

		function transformAnimationData( keyframes, property, defaultValue ) {

			var keyframe;

			var empty = true;
			var i, l;

			// check, if values of a property are missing in our keyframes

			for ( i = 0, l = keyframes.length; i < l; i ++ ) {

				keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] === undefined ) {

					keyframe.value[ property ] = null; // mark as missing

				} else {

					empty = false;

				}

			}

			if ( empty === true ) {

				// no values at all, so we set a default value

				for ( i = 0, l = keyframes.length; i < l; i ++ ) {

					keyframe = keyframes[ i ];

					keyframe.value[ property ] = defaultValue;

				}

			} else {

				// filling gaps

				createMissingKeyframes( keyframes, property );

			}

		}

		function createMissingKeyframes( keyframes, property ) {

			var prev, next;

			for ( var i = 0, l = keyframes.length; i < l; i ++ ) {

				var keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] === null ) {

					prev = getPrev( keyframes, i, property );
					next = getNext( keyframes, i, property );

					if ( prev === null )  {

						keyframe.value[ property ] = next.value[ property ];
						continue;

					}

					if ( next === null ) {

						keyframe.value[ property ] = prev.value[ property ];
						continue;

					}

					interpolate( keyframe, prev, next, property );

				}

			}

		}

		function getPrev( keyframes, i, property ) {

			while ( i >= 0 ) {

				var keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] !== null ) return keyframe;

				i --;

			}

			return null;

		}

		function getNext( keyframes, i, property ) {

			while ( i < keyframes.length ) {

				var keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] !== null ) return keyframe;

				i ++;

			}

			return null;

		}

		function interpolate( key, prev, next, property ) {

			if ( ( next.time - prev.time ) === 0 ) {

				key.value[ property ] = prev.value[ property ];
				return;

			}

			key.value[ property ] = ( ( key.time - prev.time ) * ( next.value[ property ] - prev.value[ property ] ) / ( next.time - prev.time ) ) + prev.value[ property ];

		}

		// animation clips

		function parseAnimationClip( xml ) {

			var data = {
				name: xml.getAttribute( 'id' ) || 'default',
				start: parseFloat( xml.getAttribute( 'start' ) || 0 ),
				end: parseFloat( xml.getAttribute( 'end' ) || 0 ),
				animations: []
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'instance_animation':
						data.animations.push( parseId( child.getAttribute( 'url' ) ) );
						break;

				}

			}

			library.clips[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildAnimationClip( data ) {

			var tracks = [];

			var name = data.name;
			var duration = ( data.end - data.start ) || - 1;
			var animations = data.animations;

			for ( var i = 0, il = animations.length; i < il; i ++ ) {

				var animationTracks = getAnimation( animations[ i ] );

				for ( var j = 0, jl = animationTracks.length; j < jl; j ++ ) {

					tracks.push( animationTracks[ j ] );

				}

			}

			return new THREE.AnimationClip( name, duration, tracks );

		}

		function getAnimationClip( id ) {

			return getBuild( library.clips[ id ], buildAnimationClip );

		}

		// controller

		function parseController( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'skin':
						// there is exactly one skin per controller
						data.id = parseId( child.getAttribute( 'source' ) );
						data.skin = parseSkin( child );
						break;

				}

			}

			library.controllers[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseSkin( xml ) {

			var data = {
				sources: {}
			}

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'bind_shape_matrix':
						data.bindShapeMatrix = parseFloats( child.textContent );
						break;

					case 'source':
						var id = child.getAttribute( 'id' );
						data.sources[ id ] = parseSource( child );
						break;

					case 'joints':
						data.joints = parseJoints( child );
						break;

					case 'vertex_weights':
						data.vertexWeights = parseVertexWeights( child );
						break;

				}

			}

			return data;

		}

		function parseJoints( xml ) {

			var data = {
				inputs: {}
			}

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						var semantic = child.getAttribute( 'semantic' );
						var id = parseId( child.getAttribute( 'source' ) );
						data.inputs[ semantic ] = id;
						break;

				}

			}

			return data;

		}

		function parseVertexWeights( xml ) {

			var data = {
				inputs: {}
			}

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						var semantic = child.getAttribute( 'semantic' );
						var id = parseId( child.getAttribute( 'source' ) );
						var offset = parseInt( child.getAttribute( 'offset' ) );
						data.inputs[ semantic ] = { id: id, offset: offset };
						break;

					case 'vcount':
						data.vcount = parseInts( child.textContent );
						break;

					case 'v':
						data.v = parseInts( child.textContent );
						break;

				}

			}

			return data;

		}

		function buildController( data ) {

			var build = {};

			build.id = data.id;
			build.skin = buildSkin( data.skin );

			// we enhance the 'sources' property of the corresponding geometry with our skin data

			var geometry = library.geometries[ build.id ];
			geometry.sources.skinIndices = build.skin.indices;
			geometry.sources.skinWeights = build.skin.weights;

			return build;

		}

		function buildSkin( data ) {

			var BONE_LIMIT = 4;

			var build = {
				bones: {},
				indices: {
					array: [],
					stride: BONE_LIMIT
				},
				weights: {
					array: [],
					stride: BONE_LIMIT
				}
			};

			var sources = data.sources;
			var vertexWeights = data.vertexWeights;

			var vcount = vertexWeights.vcount;
			var v = vertexWeights.v;
			var jointOffset = vertexWeights.inputs.JOINT.offset;
			var weightOffset = vertexWeights.inputs.WEIGHT.offset;

			var jointSource = data.sources[ data.joints.inputs.JOINT ];
			var inverseSource = data.sources[ data.joints.inputs.INV_BIND_MATRIX ];

			var weights = sources[ vertexWeights.inputs.WEIGHT.id ].array;
			var stride = 0;

			var i, j, l;

			// procces skin data for each vertex

			for ( i = 0, l = vcount.length; i < l; i ++ ) {

				var jointCount = vcount[ i ]; // this is the amount of joints that affect a single vertex
				var vertexSkinData = [];

				for ( j = 0; j < jointCount; j ++ ) {

					var skinIndex = v[ stride + jointOffset ];
					var weightId = v[ stride + weightOffset ];
					var skinWeight = weights[ weightId ];

					vertexSkinData.push( { index: skinIndex, weight: skinWeight } );

					stride += 2;

				}

				// we sort the joints in descending order based on the weights.
				// this ensures, we only procced the most important joints of the vertex

				vertexSkinData.sort( descending );

				// now we provide for each vertex a set of four index and weight values.
				// the order of the skin data matches the order of vertices

				for ( j = 0; j < BONE_LIMIT; j ++ ) {

					var d = vertexSkinData[ j ];

					if ( d !== undefined ) {

						build.indices.array.push( d.index );
						build.weights.array.push( d.weight );

					} else {

						build.indices.array.push( 0 );
						build.weights.array.push( 0 );

					}

				}

			}

			// setup bind matrix

			build.bindMatrix = new THREE.Matrix4().fromArray( data.bindShapeMatrix ).transpose();

			// process bones and inverse bind matrix data

			for ( i = 0, l = jointSource.array.length; i < l; i ++ ) {

				var name = jointSource.array[ i ];
				var boneInverse = new THREE.Matrix4().fromArray( inverseSource.array, i * inverseSource.stride ).transpose();

				build.bones[ name ] = boneInverse;

			}

			return build;

			// array sort function

			function descending( a, b ) {

				return b.weight - a.weight;

			}

		}

		function getController( id ) {

			return getBuild( library.controllers[ id ], buildController );

		}

		// image

		function parseImage( xml ) {

			var data = {
				init_from: getElementsByTagName( xml, 'init_from' )[ 0 ].textContent
			};

			library.images[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildImage( data ) {

			if ( data.build !== undefined ) return data.build;

			return data.init_from;

		}

		function getImage( id ) {

			return getBuild( library.images[ id ], buildImage );

		}

		// effect

		function parseEffect( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'profile_COMMON':
						data.profile = parseEffectProfileCOMMON( child );
						break;

				}

			}

			library.effects[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseEffectProfileCOMMON( xml ) {

			var data = {
				surfaces: {},
				samplers: {}
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'newparam':
						parseEffectNewparam( child, data );
						break;

					case 'technique':
						data.technique = parseEffectTechnique( child );
						break;

				}

			}

			return data;

		}

		function parseEffectNewparam( xml, data ) {

			var sid = xml.getAttribute( 'sid' );

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'surface':
						data.surfaces[ sid ] = parseEffectSurface( child );
						break;

					case 'sampler2D':
						data.samplers[ sid ] = parseEffectSampler( child );
						break;

				}

			}

		}

		function parseEffectSurface( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'init_from':
						data.init_from = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectSampler( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'source':
						data.source = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectTechnique( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'constant':
					case 'lambert':
					case 'blinn':
					case 'phong':
						data.type = child.nodeName;
						data.parameters = parseEffectParameters( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameters( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'emission':
					case 'diffuse':
					case 'specular':
					case 'shininess':
					case 'transparent':
					case 'transparency':
						data[ child.nodeName ] = parseEffectParameter( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameter( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'color':
						data[ child.nodeName ] = parseFloats( child.textContent );
						break;

					case 'float':
						data[ child.nodeName ] = parseFloat( child.textContent );
						break;

					case 'texture':
						data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), extra: parseEffectParameterTexture( child ) };
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTexture( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'extra':
						data = parseEffectParameterTextureExtra( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTextureExtra( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique':
						data[ child.nodeName ] = parseEffectParameterTextureExtraTechnique( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTextureExtraTechnique( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'repeatU':
					case 'repeatV':
					case 'offsetU':
					case 'offsetV':
						data[ child.nodeName ] = parseFloat( child.textContent );
						break;

					case 'wrapU':
					case 'wrapV':
						data[ child.nodeName ] = parseInt( child.textContent );
						break;

				}

			}

			return data;

		}

		function buildEffect( data ) {

			return data;

		}

		function getEffect( id ) {

			return getBuild( library.effects[ id ], buildEffect );

		}

		// material

		function parseMaterial( xml ) {

			var data = {
				name: xml.getAttribute( 'name' )
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'instance_effect':
						data.url = parseId( child.getAttribute( 'url' ) );
						break;

				}

			}

			library.materials[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildMaterial( data ) {

			var effect = getEffect( data.url );
			var technique = effect.profile.technique;

			var material;

			switch ( technique.type ) {

				case 'phong':
				case 'blinn':
					material = new THREE.MeshPhongMaterial();
					break;

				case 'lambert':
					material = new THREE.MeshLambertMaterial();
					break;

				default:
					material = new THREE.MeshBasicMaterial();
					break;

			}

			material.name = data.name;

			function getTexture( textureObject ) {

				var sampler = effect.profile.samplers[ textureObject.id ];

				if ( sampler !== undefined ) {

					var surface = effect.profile.surfaces[ sampler.source ];

					var texture = textureLoader.load( getImage( surface.init_from ) );

					var extra = textureObject.extra;

					if ( extra !== undefined && extra.technique !== undefined ) {

						var technique = extra.technique;

						texture.wrapS = technique.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
						texture.wrapT = technique.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

						texture.offset.set( technique.offsetU || 0, technique.offsetV || 0 );
						texture.repeat.set( technique.repeatU || 1, technique.repeatV || 1 );

					} else {

						texture.wrapS = THREE.RepeatWrapping;
						texture.wrapT = THREE.RepeatWrapping;

					}

					return texture;

				}

				console.error( 'THREE.ColladaLoader: Undefined sampler', textureObject.id );

				return null;

			}

			var parameters = technique.parameters;

			for ( var key in parameters ) {

				var parameter = parameters[ key ];

				switch ( key ) {

					case 'diffuse':
						if ( parameter.color ) material.color.fromArray( parameter.color );
						if ( parameter.texture ) material.map = getTexture( parameter.texture );
						break;
					case 'specular':
						if ( parameter.color && material.specular )
							material.specular.fromArray( parameter.color );
						break;
					case 'shininess':
						if ( parameter.float && material.shininess )
							material.shininess = parameter.float;
						break;
					case 'emission':
						if ( parameter.color && material.emissive )
							material.emissive.fromArray( parameter.color );
						break;
					case 'transparent':
						// if ( parameter.texture ) material.alphaMap = getTexture( parameter.texture );
						material.transparent = true;
						break;
					case 'transparency':
						if ( parameter.float !== undefined ) material.opacity = parameter.float;
						material.transparent = true;
						break;

				}

			}

			return material;

		}

		function getMaterial( id ) {

			return getBuild( library.materials[ id ], buildMaterial );

		}

		// camera

		function parseCamera( xml ) {

			var data = {
				name: xml.getAttribute( 'name' )
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'optics':
						data.optics = parseCameraOptics( child );
						break;

				}

			}

			library.cameras[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseCameraOptics( xml ) {

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'technique_common':
						return parseCameraTechnique( child );

				}

			}

			return {};

		}

		function parseCameraTechnique( xml ) {

			var data = {};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'perspective':
					case 'orthographic':

						data.technique = child.nodeName;
						data.parameters = parseCameraParameters( child );

						break;

				}

			}

			return data;

		}

		function parseCameraParameters( xml ) {

			var data = {};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'xfov':
					case 'yfov':
					case 'xmag':
					case 'ymag':
					case 'znear':
					case 'zfar':
					case 'aspect_ratio':
						data[ child.nodeName ] = parseFloat( child.textContent );
						break;

				}

			}

			return data;

		}

		function buildCamera( data ) {

			var camera;

			switch ( data.optics.technique ) {

				case 'perspective':
					camera = new THREE.PerspectiveCamera(
						data.optics.parameters.yfov,
						data.optics.parameters.aspect_ratio,
						data.optics.parameters.znear,
						data.optics.parameters.zfar
					);
					break;

				case 'orthographic':
					var ymag = data.optics.parameters.ymag;
					var xmag = data.optics.parameters.xmag;
					var aspectRatio = data.optics.parameters.aspect_ratio;

					xmag = ( xmag === undefined ) ? ( ymag * aspectRatio ) : xmag;
					ymag = ( ymag === undefined ) ? ( xmag / aspectRatio ) : ymag;

					xmag *= 0.5;
					ymag *= 0.5;

					camera = new THREE.OrthographicCamera(
						- xmag, xmag, ymag, - ymag, // left, right, top, bottom
						data.optics.parameters.znear,
						data.optics.parameters.zfar
					);
					break;

				default:
					camera = new THREE.PerspectiveCamera();
					break;

			}

			camera.name = data.name;

			return camera;

		}

		function getCamera( id ) {

			return getBuild( library.cameras[ id ], buildCamera );

		}

		// light

		function parseLight( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique_common':
						data = parseLightTechnique( child );
						break;

				}

			}

			library.lights[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseLightTechnique( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'directional':
					case 'point':
					case 'spot':
					case 'ambient':

						data.technique = child.nodeName;
						data.parameters = parseLightParameters( child );

				}

			}

			return data;

		}

		function parseLightParameters( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'color':
						var array = parseFloats( child.textContent );
						data.color = new THREE.Color().fromArray( array );
						break;

					case 'falloff_angle':
						data.falloffAngle = parseFloat( child.textContent );
						break;

					case 'quadratic_attenuation':
						var f = parseFloat( child.textContent );
						data.distance = f ? Math.sqrt( 1 / f ) : 0;
						break;

				}

			}

			return data;

		}

		function buildLight( data ) {

			var light;

			switch ( data.technique ) {

				case 'directional':
					light = new THREE.DirectionalLight();
					break;

				case 'point':
					light = new THREE.PointLight();
					break;

				case 'spot':
					light = new THREE.SpotLight();
					break;

				case 'ambient':
					light = new THREE.AmbientLight();
					break;

			}

			if ( data.parameters.color ) light.color.copy( data.parameters.color );
			if ( data.parameters.distance ) light.distance = data.parameters.distance;

			return light;

		}

		function getLight( id ) {

			return getBuild( library.lights[ id ], buildLight );

		}

		// geometry

		function parseGeometry( xml ) {

			var data = {
				name: xml.getAttribute( 'name' ),
				sources: {},
				vertices: {},
				primitives: []
			};

			var mesh = getElementsByTagName( xml, 'mesh' )[ 0 ];

			for ( var i = 0; i < mesh.childNodes.length; i ++ ) {

				var child = mesh.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				var id = child.getAttribute( 'id' );

				switch ( child.nodeName ) {

					case 'source':
						data.sources[ id ] = parseSource( child );
						break;

					case 'vertices':
						// data.sources[ id ] = data.sources[ parseId( getElementsByTagName( child, 'input' )[ 0 ].getAttribute( 'source' ) ) ];
						data.vertices = parseGeometryVertices( child );
						break;

					case 'polygons':
						console.warn( 'THREE.ColladaLoader: Unsupported primitive type: ', child.nodeName );
						break;

					case 'lines':
					case 'linestrips':
					case 'polylist':
					case 'triangles':
						data.primitives.push( parseGeometryPrimitive( child ) );
						break;

					default:
						console.log( child );

				}

			}

			library.geometries[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseSource( xml ) {

			var data = {
				array: [],
				stride: 3
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'float_array':
						data.array = parseFloats( child.textContent );
						break;

					case 'Name_array':
						data.array = parseStrings( child.textContent );
						break;

					case 'technique_common':
						var accessor = getElementsByTagName( child, 'accessor' )[ 0 ];

						if ( accessor !== undefined ) {

							data.stride = parseInt( accessor.getAttribute( 'stride' ) );

						}
						break;

				}

			}

			return data;

		}

		function parseGeometryVertices( xml ) {

			var data = {};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				data[ child.getAttribute( 'semantic' ) ] = parseId( child.getAttribute( 'source' ) );

			}

			return data;

		}

		function parseGeometryPrimitive( xml ) {

			var primitive = {
				type: xml.nodeName,
				material: xml.getAttribute( 'material' ),
				inputs: {},
				stride: 0
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						var id = parseId( child.getAttribute( 'source' ) );
						var semantic = child.getAttribute( 'semantic' );
						var offset = parseInt( child.getAttribute( 'offset' ) );
						primitive.inputs[ semantic ] = { id: id, offset: offset };
						primitive.stride = Math.max( primitive.stride, offset + 1 );
						break;

					case 'vcount':
						primitive.vcount = parseInts( child.textContent );
						break;

					case 'p':
						primitive.p = parseInts( child.textContent );
						break;

				}

			}

			return primitive;

		}

		var DEFAULT_LINEMATERIAL = new THREE.LineBasicMaterial();
		var DEFAULT_MESHMATERIAL = new THREE.MeshPhongMaterial();

		function buildGeometry( data ) {

			var group = {};

			var sources = data.sources;
			var vertices = data.vertices;
			var primitives = data.primitives;

			var skinning = false;

			if ( primitives.length === 0 ) return group;

			for ( var p = 0; p < primitives.length; p ++ ) {

				var primitive = primitives[ p ];
				var inputs = primitive.inputs;

				var geometry = new THREE.BufferGeometry();

				if ( data.name ) geometry.name = data.name;

				for ( var name in inputs ) {

					var input = inputs[ name ];

					switch ( name )	{

						case 'VERTEX':
							for ( var key in vertices ) {

								geometry.addAttribute( key.toLowerCase(), buildGeometryAttribute( primitive, sources[ vertices[ key ] ], input.offset ) );

								if ( key.toLowerCase() === 'position' && sources.skinWeights && sources.skinIndices ) {

									geometry.addAttribute( 'skinWeight', buildGeometryAttribute( primitive, sources.skinWeights, input.offset ) );
									geometry.addAttribute( 'skinIndex', buildGeometryAttribute( primitive, sources.skinIndices, input.offset ) );

									skinning = true;

								}

							}
							break;

						case 'NORMAL':
							geometry.addAttribute( 'normal', buildGeometryAttribute( primitive, sources[ input.id ], input.offset ) );
							break;

						case 'COLOR':
							geometry.addAttribute( 'color', buildGeometryAttribute( primitive, sources[ input.id ], input.offset ) );
							break;

						case 'TEXCOORD':
							geometry.addAttribute( 'uv', buildGeometryAttribute( primitive, sources[ input.id ], input.offset ) );
							break;

					}

				}

				var object;

				switch ( primitive.type ) {

					case 'lines':
						object = new THREE.LineSegments( geometry, DEFAULT_LINEMATERIAL );
						break;

					case 'linestrips':
						object = new THREE.Line( geometry, DEFAULT_LINEMATERIAL );
						break;

					case 'triangles':
					case 'polylist':
						object = ( skinning === true ) ? new THREE.SkinnedMesh( geometry, DEFAULT_MESHMATERIAL ) : new THREE.Mesh( geometry, DEFAULT_MESHMATERIAL );
						break;

				}

				group[ primitive.material ] = object;

			}

			return group;

		}

		function buildGeometryAttribute( primitive, source, offset ) {

			var indices = primitive.p;
			var stride = primitive.stride;
			var vcount = primitive.vcount;

			function pushVector( i ) {

				var index = indices[ i + offset ] * sourceStride;
				var length = index + sourceStride;

				for ( ; index < length; index ++ ) {

					array.push( sourceArray[ index ] );

				}

			}

			var maxcount = 0;

			var sourceArray = source.array;
			var sourceStride = source.stride;

			var array = [];

			if ( primitive.vcount !== undefined ) {

				var index = 0;

				for ( var i = 0, l = vcount.length; i < l; i ++ ) {

					var count = vcount[ i ];

					if ( count === 4 ) {

						var a = index + stride * 0;
						var b = index + stride * 1;
						var c = index + stride * 2;
						var d = index + stride * 3;

						pushVector( a ); pushVector( b ); pushVector( d );
						pushVector( b ); pushVector( c ); pushVector( d );

					} else if ( count === 3 ) {

						var a = index + stride * 0;
						var b = index + stride * 1;
						var c = index + stride * 2;

						pushVector( a ); pushVector( b ); pushVector( c );

					} else {

						maxcount = Math.max( maxcount, count );

					}

					index += stride * count;

				}

				if ( maxcount > 0 ) {

					console.log( 'THREE.ColladaLoader: Geometry has faces with more than 4 vertices.' );

				}

			} else {

				for ( var i = 0, l = indices.length; i < l; i += stride ) {

					pushVector( i );

				}

			}

			return new THREE.Float32BufferAttribute( array, sourceStride );

		}

		function getGeometry( id ) {

			return getBuild( library.geometries[ id ], buildGeometry );

		}

		// nodes

		var matrix = new THREE.Matrix4();
		var vector = new THREE.Vector3();

		function parseNode( xml ) {

			var data = {
				name: xml.getAttribute( 'name' ),
				type: xml.getAttribute( 'type' ),
				id: xml.getAttribute( 'id' ),
				sid: xml.getAttribute( 'sid' ),
				matrix: new THREE.Matrix4(),
				nodes: [],
				instanceCameras: [],
				instanceControllers: [],
				instanceLights: [],
				instanceGeometries: [],
				instanceNodes: [],
				transforms: {}
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'node':

						if ( child.hasAttribute( 'id' ) ) {

							data.nodes.push( child.getAttribute( 'id' ) );
							parseNode( child );

						}

						break;

					case 'instance_camera':
						data.instanceCameras.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'instance_controller':
						data.instanceControllers.push( parseNodeInstance( child ) );
						break;

					case 'instance_light':
						data.instanceLights.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'instance_geometry':
						data.instanceGeometries.push( parseNodeInstance( child ) );
						break;

					case 'instance_node':
						data.instanceNodes.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'matrix':
						var array = parseFloats( child.textContent );
						data.matrix.multiply( matrix.fromArray( array ).transpose() );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'translate':
						var array = parseFloats( child.textContent );
						vector.fromArray( array );
						data.matrix.multiply( matrix.makeTranslation( vector.x, vector.y, vector.z ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'rotate':
						var array = parseFloats( child.textContent );
						var angle = THREE.Math.degToRad( array[ 3 ] );
						data.matrix.multiply( matrix.makeRotationAxis( vector.fromArray( array ), angle ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'scale':
						var array = parseFloats( child.textContent );
						data.matrix.scale( vector.fromArray( array ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'extra':
						break;

					default:
						console.log( child );

				}

			}

			if ( xml.hasAttribute( 'id' ) ) {

				library.nodes[ xml.getAttribute( 'id' ) ] = data;

			}

			return data;

		}

		function parseNodeInstance( xml ) {

			var data = {
				id: parseId( xml.getAttribute( 'url' ) ),
				materials: {}
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'bind_material':
						var instances = child.getElementsByTagName( 'instance_material' );

						for ( var j = 0; j < instances.length; j ++ ) {

							var instance = instances[ j ];
							var symbol = instance.getAttribute( 'symbol' );
							var target = instance.getAttribute( 'target' );

							data.materials[ symbol ] = parseId( target );

						}

						break;

					case 'skeleton':
						data.skeleton = parseId( child.textContent );;
						break;

					default:
						break;

				}

			}

			return data;

		}

		function getSkeleton( root, controller ) {

			var boneArray = [];
			var boneInverseArray = [];

			root.traverse( function( object ) {

				if ( object.isBone === true ) {

					boneArray.push( object );
					boneInverseArray.push( controller.skin.bones[ object.name ] );

				}

			} );

			return new THREE.Skeleton( boneArray, boneInverseArray );

		}

		function buildNode( data ) {

			var objects = [];

			var matrix = data.matrix;
			var nodes = data.nodes;
			var type = data.type;
			var instanceCameras = data.instanceCameras;
			var instanceControllers = data.instanceControllers;
			var instanceLights = data.instanceLights;
			var instanceGeometries = data.instanceGeometries;
			var instanceNodes = data.instanceNodes;

			for ( var i = 0, l = nodes.length; i < l; i ++ ) {

				objects.push( getNode( nodes[ i ] ).clone() );

			}

			for ( var i = 0, l = instanceCameras.length; i < l; i ++ ) {

				objects.push( getCamera( instanceCameras[ i ] ).clone() );

			}

			for ( var i = 0, l = instanceControllers.length; i < l; i ++ ) {

				var instance = instanceControllers[ i ];
				var controller = getController( instance.id );
				var geometries = getGeometry( controller.id );

				var node = getNode( instance.skeleton );
				var skeleton = getSkeleton( node, controller );

				for ( var key in geometries ) {

					var object = geometries[ key ].clone();

					if ( instance.materials[ key ] !== undefined ) {

						object.bind( skeleton, controller.skin.bindMatrix );
						object.normalizeSkinWeights();
						object.bones = skeleton.bones; // this is necessary for property binding
						object.add( node ); // bone hierarchy is a child of the skinned mesh

						object.material = getMaterial( instance.materials[ key ] );
						object.material.skinning = true;

					}

					objects.push( object );

				}

			}

			for ( var i = 0, l = instanceLights.length; i < l; i ++ ) {

				objects.push( getLight( instanceLights[ i ] ).clone() );

			}

			for ( var i = 0, l = instanceGeometries.length; i < l; i ++ ) {

				var instance = instanceGeometries[ i ];
				var geometries = getGeometry( instance.id );

				for ( var key in geometries ) {

					var object = geometries[ key ].clone();

					if ( instance.materials[ key ] !== undefined ) {

						object.material = getMaterial( instance.materials[ key ] );

					}

					objects.push( object );

				}

			}

			for ( var i = 0, l = instanceNodes.length; i < l; i ++ ) {

				objects.push( getNode( instanceNodes[ i ] ).clone() );

			}

			var object;

			if ( nodes.length === 0 && objects.length === 1 ) {

				object = objects[ 0 ];

			} else {

				object = ( type === 'JOINT' ) ? new THREE.Bone() : new THREE.Group();

				for ( var i = 0; i < objects.length; i ++ ) {

					object.add( objects[ i ] );

				}

			}

			object.name = ( type === 'JOINT' ) ? data.sid : data.name;
			object.matrix.copy( matrix );
			object.matrix.decompose( object.position, object.quaternion, object.scale );

			return object;

		}

		function getNode( id ) {

			return getBuild( library.nodes[ id ], buildNode );

		}

		// visual scenes

		function parseVisualScene( xml ) {

			var data = {
				name: xml.getAttribute( 'name' ),
				children: []
			};

			var elements = getElementsByTagName( xml, 'node' );

			for ( var i = 0; i < elements.length; i ++ ) {

				data.children.push( parseNode( elements[ i ] ) );

			}

			library.visualScenes[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildVisualScene( data ) {

			var group = new THREE.Group();
			group.name = data.name;

			var children = data.children;

			for ( var i = 0; i < children.length; i ++ ) {

				group.add( buildNode( children[ i ] ) );

			}

			return group;

		}

		function getVisualScene( id ) {

			return getBuild( library.visualScenes[ id ], buildVisualScene );

		}

		// scenes

		function parseScene( xml ) {

			var instance = getElementsByTagName( xml, 'instance_visual_scene' )[ 0 ];
			return getVisualScene( parseId( instance.getAttribute( 'url' ) ) );

		}

		function setupAnimations() {

			var clips = library.clips;

			if ( isEmpty( clips ) === true ) {

				if ( isEmpty( library.animations ) === false ) {

					// if there are animations but no clips, we create a default clip for playback

					var tracks = [];

					for ( var id in library.animations ) {

						var animationTracks = getAnimation( id );

						for ( var i = 0, l = animationTracks.length; i < l; i ++ ) {

							tracks.push( animationTracks[ i ] );

						}

					}

					animations.push( new THREE.AnimationClip( 'default', - 1, tracks ) );

				}

			} else {

				for ( var id in clips ) {

					animations.push( getAnimationClip( id ) );

				}

			}

		}

		console.time( 'THREE.ColladaLoader' );

		if ( text.length === 0 ) {

			return { scene: new THREE.Scene() };

		}

		console.time( 'THREE.ColladaLoader: DOMParser' );

		var xml = new DOMParser().parseFromString( text, 'application/xml' );

		console.timeEnd( 'THREE.ColladaLoader: DOMParser' );

		var collada = getElementsByTagName( xml, 'COLLADA' )[ 0 ];

		// metadata

		var version = collada.getAttribute( 'version' );
		console.log( 'THREE.ColladaLoader: File version', version );

		var asset = parseAsset( getElementsByTagName( collada, 'asset' )[ 0 ] );
		var textureLoader = new THREE.TextureLoader( this.manager ).setPath( resourceDirectory );

		//

		var animations = [];

		//

		var library = {
			animations: {},
			clips: {},
			controllers: {},
			images: {},
			effects: {},
			materials: {},
			cameras: {},
			lights: {},
			geometries: {},
			nodes: {},
			visualScenes: {}
		};

		console.time( 'THREE.ColladaLoader: Parse' );

		parseLibrary( collada, 'library_animations', 'animation', parseAnimation );
		parseLibrary( collada, 'library_animation_clips', 'animation_clip', parseAnimationClip );
		parseLibrary( collada, 'library_controllers', 'controller', parseController );
		parseLibrary( collada, 'library_images', 'image', parseImage );
		parseLibrary( collada, 'library_effects', 'effect', parseEffect );
		parseLibrary( collada, 'library_materials', 'material', parseMaterial );
		parseLibrary( collada, 'library_cameras', 'camera', parseCamera );
		parseLibrary( collada, 'library_lights', 'light', parseLight );
		parseLibrary( collada, 'library_geometries', 'geometry', parseGeometry );
		parseLibrary( collada, 'library_nodes', 'node', parseNode );
		parseLibrary( collada, 'library_visual_scenes', 'visual_scene', parseVisualScene );

		console.timeEnd( 'THREE.ColladaLoader: Parse' );

		console.time( 'THREE.ColladaLoader: Build' );

		buildLibrary( library.animations, buildAnimation );
		buildLibrary( library.clips, buildAnimationClip );
		buildLibrary( library.controllers, buildController );
		buildLibrary( library.images, buildImage );
		buildLibrary( library.effects, buildEffect );
		buildLibrary( library.materials, buildMaterial );
		buildLibrary( library.cameras, buildCamera );
		buildLibrary( library.lights, buildLight );
		buildLibrary( library.geometries, buildGeometry );
		buildLibrary( library.visualScenes, buildVisualScene );

		console.timeEnd( 'THREE.ColladaLoader: Build' );

		setupAnimations();

		var scene = parseScene( getElementsByTagName( collada, 'scene' )[ 0 ] );

		if ( asset.upAxis === 'Z_UP' ) {

			scene.rotation.x = - Math.PI / 2;

		}

		scene.scale.multiplyScalar( asset.unit );

		console.timeEnd( 'THREE.ColladaLoader' );

		return {
			animations: animations,
			library: library,
			scene: scene
		};

	}

};

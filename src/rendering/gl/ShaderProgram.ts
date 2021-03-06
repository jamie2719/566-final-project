import {vec4, mat4, vec2, vec3} from 'gl-matrix';
import Drawable from './Drawable';
import Texture from './Texture';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;
  attrUV: number;
  attrType: number;
  attrTranslate: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifView: WebGLUniformLocation;
  unifProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifDim: WebGLUniformLocation;
  unifLight: WebGLUniformLocation;
  unifViewToLightMat: WebGLUniformLocation;
  unifCamPos: WebGLUniformLocation;


  unifLightModel: WebGLUniformLocation;
  unifLightView: WebGLUniformLocation;
  unifLightProj: WebGLUniformLocation;
  unifLightOrtho: WebGLUniformLocation;

  unifShadowMat: WebGLUniformLocation;

  unifViewProjMat: WebGLUniformLocation;
  unifViewProjOrthoMat: WebGLUniformLocation;
  unifInvViewProjMat: WebGLUniformLocation;


  unifTexUnits: Map<string, WebGLUniformLocation>;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrTranslate = gl.getAttribLocation(this.prog, "vs_Translate");
    this.attrType = gl.getAttribLocation(this.prog, "vs_Type");
    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrUV = gl.getAttribLocation(this.prog, "vs_UV")
    this.unifModel = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifView = gl.getUniformLocation(this.prog, "u_View");
    this.unifProj = gl.getUniformLocation(this.prog, "u_Proj");
    this.unifColor = gl.getUniformLocation(this.prog, "u_Color");
    this.unifTime = gl.getUniformLocation(this.prog, "u_Time");
    this.unifDim = gl.getUniformLocation(this.prog, "u_Dimensions");
    this.unifLight = gl.getUniformLocation(this.prog, "u_LightPos");
    this.unifCamPos = gl.getUniformLocation(this.prog, "u_CamPos");

    this.unifLightModel = gl.getUniformLocation(this.prog, "u_LightModel");
    this.unifLightView = gl.getUniformLocation(this.prog, "u_LightView");
    this.unifLightProj = gl.getUniformLocation(this.prog, "u_LightProj");
    this.unifLightOrtho = gl.getUniformLocation(this.prog, "u_LightOrtho");

    this.unifViewToLightMat = gl.getUniformLocation(this.prog, "u_WorldToLightMat");

    this.unifShadowMat = gl.getUniformLocation(this.prog, "u_ShadowMat");

    this.unifViewProjMat = gl.getUniformLocation(this.prog, "u_viewProjMat");
    this.unifViewProjOrthoMat = gl.getUniformLocation(this.prog, "u_viewProjOrthoMat");
    this.unifInvViewProjMat = gl.getUniformLocation(this.prog, "u_invViewProjMat");

    this.unifTexUnits = new Map<string, WebGLUniformLocation>();
  }

  setupTexUnits(handleNames: Array<string>) {
    for (let handle of handleNames) {
      var location = gl.getUniformLocation(this.prog, handle);
      if (location !== -1) {
        this.unifTexUnits.set(handle, location);
      } else {
        console.log("Could not find handle for texture named: \'" + handle + "\'!");
      }
    }
  }

  // Bind the given Texture to the given texture unit
  bindTexToUnit(handleName: string, tex: Texture, unit: number) {
    this.use();
    var location = this.unifTexUnits.get(handleName);
    if (location !== undefined) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      tex.bindTex();
      gl.uniform1i(location, unit);
    } else {
      console.log("Texture with handle name: \'" + handleName + "\' was not found");
    }
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setLightModelMatrix(model: mat4) {
    this.use();
    if (this.unifLightModel !== -1) {
      gl.uniformMatrix4fv(this.unifLightModel, false, model);
    }
  }

   setWorldToLightMatrix(m: mat4) {
     this.use();
     if (this.unifViewToLightMat !== -1) {
        gl.uniformMatrix4fv(this.unifViewToLightMat, false, m);
     }
   }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setInvViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifInvViewProjMat !== -1) {
      gl.uniformMatrix4fv(this.unifInvViewProjMat, false, vp);
    }
  }

  setViewMatrix(vp: mat4) {
    this.use();
    if (this.unifView !== -1) {
      gl.uniformMatrix4fv(this.unifView, false, vp);
    }
  }

  setLightViewMatrix(vp: mat4) {
    this.use();
    if (this.unifLightView !== -1) {
      gl.uniformMatrix4fv(this.unifLightView, false, vp);
    }
  }

  setProjMatrix(vp: mat4) {
    this.use();
    if (this.unifProj !== -1) {
      gl.uniformMatrix4fv(this.unifProj, false, vp);
    }
  }

  setLightProjMatrix(vp: mat4) {
    this.use();
    if (this.unifLightProj !== -1) {
      gl.uniformMatrix4fv(this.unifLightProj, false, vp);
    }
  }

  setLightOrthoMatrix(vp: mat4) {
    this.use();
    if (this.unifLightOrtho !== -1) {
      gl.uniformMatrix4fv(this.unifLightOrtho, false, vp);
    }
  }

  setShadowMat(m: mat4) {
    this.use();
    if (this.unifShadowMat !== -1) {
      gl.uniformMatrix4fv(this.unifShadowMat, false, m);
    }
  }

  setViewProjMat(model: mat4) {
    this.use();
    if (this.unifViewProjMat !== -1) {
      gl.uniformMatrix4fv(this.unifViewProjMat, false, model);
    }
  }

  setViewProjOrthoMat(model: mat4) {
    this.use();
    if (this.unifViewProjOrthoMat !== -1) {
      gl.uniformMatrix4fv(this.unifViewProjOrthoMat, false, model);
    }
  }

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
    }
  }

  setCamPos(c: vec4) {
    this.use();
    if (this.unifCamPos !== -1) {
      gl.uniform4fv(this.unifCamPos, c);
    }
  }

  setTime(t: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, t);
    }
  }

  setDimensions(d: vec2) {
    this.use();
    if (this.unifDim !== -1) {
      gl.uniform2fv(this.unifDim, d);
    }
  }

  setLightPos(l: vec4) {
    this.use();
    if (this.unifLight !== -1) {
      gl.uniform4fv(this.unifLight, l);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrType != -1 && d.bindType()) {
      gl.enableVertexAttribArray(this.attrType);
      gl.vertexAttribPointer(this.attrType, 1, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrType, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrNor, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrCol, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrUV, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrTranslate != -1 && d.bindTranslate()) {
      gl.enableVertexAttribArray(this.attrTranslate);
      gl.vertexAttribPointer(this.attrTranslate, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTranslate, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    d.bindIdx();
    gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, 16);

    if (this.attrType != -1) gl.disableVertexAttribArray(this.attrType);
    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrUV != -1) gl.disableVertexAttribArray(this.attrUV);
    if (this.attrTranslate != -1) gl.disableVertexAttribArray(this.attrTranslate);
  }
};

export default ShaderProgram;

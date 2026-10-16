import { describe, expect, it } from 'vitest';
import { hasImageOperationChanges, type ImageOperation, cropFromDrag, cropForRatio, removeColor, resizeCrop } from './image-transforms';
describe('editor image transforms', () => {
  it('fits centered ratios without leaving image bounds', () => {
    expect(cropForRatio(400, 200, 1)).toEqual({ x: 100, y: 0, width: 200, height: 200 });
    expect(cropForRatio(200, 400, 2)).toEqual({ x: 0, y: 150, width: 200, height: 100 });
  });
  it('handles exact color at zero tolerance without corrupting existing alpha', () => {
    const pixels = new Uint8ClampedArray([255,255,255,120, 255,254,255,80]);
    removeColor(pixels, '#ffffff', 0, true);
    expect([...pixels]).toEqual([255,255,255,0, 255,254,255,80]);
  });
  it('preserves alpha in feathered background removal', () => {
    const pixels = new Uint8ClampedArray([250,255,255,80]);
    removeColor(pixels, '#ffffff', 10, true);
    expect(pixels[3]).toBeLessThan(80);
  });
});

describe('canvas crop selection', () => {
  const bounds = { width: 400, height: 300 };
  it('draws a free rectangle in either drag direction', () => {
    expect(cropFromDrag({x:20,y:30},{x:120,y:80},bounds)).toEqual({x:20,y:30,width:100,height:50});
    expect(cropFromDrag({x:120,y:80},{x:20,y:30},bounds)).toEqual({x:20,y:30,width:100,height:50});
  });
  it('keeps a fixed ratio with the pointer on the bottom edge', () => {
    expect(cropFromDrag({x:10,y:10},{x:110,y:110},bounds,2)).toEqual({x:10,y:10,width:200,height:100});
  });
  it('keeps a fixed ratio with the pointer on the right edge', () => {
    expect(cropFromDrag({x:10,y:10},{x:210,y:60},bounds,2)).toEqual({x:10,y:10,width:200,height:100});
  });
  it('shrinks at image boundaries without breaking the ratio', () => {
    expect(cropFromDrag({x:350,y:250},{x:500,y:500},bounds,2)).toEqual({x:350,y:250,width:50,height:25});
    expect(cropFromDrag({x:50,y:50},{x:-100,y:-100},bounds,2)).toEqual({x:0,y:25,width:50,height:25});
  });
  it('does not create a selection for a click without dragging', () => {
    expect(cropFromDrag({x:50,y:50},{x:50,y:50},bounds,1)).toEqual({x:50,y:50,width:0,height:0});
  });
});

describe('crop resize handles', () => {
  const rect = {x:100,y:80,width:160,height:80};
  const bounds = {width:400,height:300};
  it('resizes a free corner while keeping its opposite corner fixed', () => {
    expect(resizeCrop(rect,'nw',{x:50,y:40},bounds)).toEqual({x:50,y:40,width:210,height:120});
  });
  it('resizes just one axis with a free edge', () => {
    expect(resizeCrop(rect,'e',{x:300,y:200},bounds)).toEqual({x:100,y:80,width:200,height:80});
  });
  it('keeps a ratio and opposite corner for corner handles', () => {
    expect(resizeCrop(rect,'se',{x:300,y:150},bounds,2)).toEqual({x:100,y:80,width:200,height:100});
  });
  it('keeps the opposite edge and other-axis center for fixed-ratio edges', () => {
    expect(resizeCrop(rect,'e',{x:300,y:120},bounds,2)).toEqual({x:100,y:70,width:200,height:100});
    expect(resizeCrop(rect,'n',{x:180,y:60},bounds,2)).toEqual({x:80,y:60,width:200,height:100});
  });
  it('limits ratio-locked edge growth to image bounds', () => {
    const resized = resizeCrop(rect,'w',{x:-100,y:120},bounds,2);
    expect(resized).toEqual({x:0,y:55,width:260,height:130});
    expect(resized.width / resized.height).toBe(2);
  });
  it('prevents an edge crossing its opposite side', () => {
    expect(resizeCrop(rect,'w',{x:350,y:120},bounds).width).toBe(1);
  });
});


describe('pending image operation detection', () => {
  const neutral: Extract<ImageOperation, {kind:'adjust'}> = {kind:'adjust',hue:0,saturation:100,brightness:100,contrast:100,opacity:100,color:'#ffffff',tolerance:0,transparent:false,feather:false};
  it('does not bake annotations when entering and leaving unchanged adjustment controls', () => {
    expect(hasImageOperationChanges(null)).toBe(false);
    expect(hasImageOperationChanges(neutral)).toBe(false);
    expect(hasImageOperationChanges({...neutral,color:'#ff0000',tolerance:120,feather:true})).toBe(false);
  });
  it.each(['hue','saturation','brightness','contrast','opacity'] as const)('recognizes an unapplied %s change for cancellation before annotation undo', field => {
    expect(hasImageOperationChanges({...neutral,[field]:neutral[field] + 1})).toBe(true);
  });
  it('recognizes exact-color transparency even at zero tolerance', () => {
    expect(hasImageOperationChanges({...neutral,transparent:true})).toBe(true);
  });
  it('ignores complete rotations but recognizes pending decimal-angle rotation', () => {
    expect(hasImageOperationChanges({kind:'rotate',angle:360})).toBe(false);
    expect(hasImageOperationChanges({kind:'rotate',angle:0.8})).toBe(true);
  });
});

export interface ImagesToGifCommand {
  listContent: string;
  args: string[];
}

export interface ImagesToGifOptions {
  inputNames: string[];
  listName: string;
  outputName: string;
  frameDuration: number;
}

// The concat demuxer leaves its terminal frame with the image demuxer's default
// frame duration instead of the trailing `duration` entry, and the `fps` filter
// ends the stream at that frame — discarding the last image. Giving the final
// image a successor moves the discarded frame onto a harmless repeat, and
// `-frames:v` stops cores that do honour the terminal duration from emitting it.
export function buildImagesToGifCommand({
  inputNames,
  listName,
  outputName,
  frameDuration,
}: ImagesToGifOptions): ImagesToGifCommand {
  const entries = [...inputNames, inputNames[inputNames.length - 1]];
  const listContent = entries
    .map((name) => `file '${name}'\nduration ${frameDuration}`)
    .join('\n');

  return {
    listContent,
    args: [
      '-f', 'concat',
      '-safe', '0',
      '-i', listName,
      '-vf', `fps=${1 / frameDuration},scale=480:-1:flags=lanczos`,
      '-frames:v', String(inputNames.length),
      '-loop', '0',
      outputName,
    ],
  };
}

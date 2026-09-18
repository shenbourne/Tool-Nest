export interface GroupCapture {
  name: string;
  value: string;
  start: number;
  end: number;
}

export interface MatchResult {
  index: number;
  value: string;
  captures: GroupCapture[];
  groups: GroupCapture[];
}

export interface RegexTestResult {
  matches: MatchResult[];
  error: string | null;
  matchCount: number;
}

export function testRegex(pattern: string, text: string, flags: string): RegexTestResult {
  if (!pattern || !text) {
    return { matches: [], error: null, matchCount: 0 };
  }

  try {
    // Add 'd' flag for indices if not already present
    let effectiveFlags = flags;
    if (!effectiveFlags.includes('d')) {
      effectiveFlags += 'd';
    }

    const re = new RegExp(pattern, effectiveFlags);
    const results: MatchResult[] = [];
    let lastIndex = -1;
    let match = re.exec(text) as RegExpExecArray & { indices?: RegExpIndices };

    while (match !== null) {
      if (re.lastIndex === lastIndex || match[0] === '') {
        break;
      }

      const captures: GroupCapture[] = [];
      const groups: GroupCapture[] = [];

      if (match.indices) {
        // Numbered captures
        for (let i = 1; i < match.length; i++) {
          if (match[i] !== undefined && match.indices[i]) {
            captures.push({
              name: String(i),
              value: match[i],
              start: match.indices[i][0],
              end: match.indices[i][1],
            });
          }
        }

        // Named groups
        if (match.groups && match.indices.groups) {
          for (const [name, value] of Object.entries(match.groups)) {
            const indices = match.indices.groups[name];
            if (value !== undefined && indices) {
              groups.push({
                name,
                value,
                start: indices[0],
                end: indices[1],
              });
            }
          }
        }
      }

      results.push({
        index: match.index,
        value: match[0],
        captures,
        groups,
      });

      lastIndex = re.lastIndex;

      if (!effectiveFlags.includes('g')) {
        break;
      }

      match = re.exec(text) as RegExpExecArray & { indices?: RegExpIndices };
    }

    return {
      matches: results,
      error: null,
      matchCount: results.length,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid regex pattern';
    return { matches: [], error: message, matchCount: 0 };
  }
}

type RegExpIndices = Array<[number, number]> & {
  groups: Record<string, [number, number]>;
};

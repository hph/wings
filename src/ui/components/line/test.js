import React from 'react';
import renderer from 'react-test-renderer';

import { Line, mapTokens, tokenizerOptions, collectTokens } from './index';

jest.mock('ui/components/token', () => 'Token');

const sampleProgram = `
import React from 'react';

export default class SomeComponent extends React.Component {
  state = {
    isMounted: false,
  };

  componentDidMount () {
    console.log('Mounted!');
    this.setSTate({ isMounted: true });
  }

  render () {
    return (
      <div>Component {!this.state.isMounted && 'not'} mounted.</div>
    );
  }
}
`.trim();

describe('tokenizer', () => {
  describe('tokenizerOptions', () => {
    it('should have a static value', () => {
      expect(tokenizerOptions).toEqual({
        plugins: {
          jsx: true,
        },
        loc: true,
      });
    });
  });

  describe('collectTokens', () => {
    it('should return an empty array in the event of an error', () => {
      expect(collectTokens('const foo = \'')).toEqual([]);
    });

    it('should output "let" as the appropriate token', () => {
      expect(collectTokens('let foo = \'bar\';')).toMatchSnapshot();
    });

    it('should output "from" as the appropriate token', () => {
      expect(collectTokens('import React from \'react\';')).toMatchSnapshot();
    });

    it('should output the appropriate token for template tags', () => {
      expect(collectTokens('`foo`')).toMatchSnapshot();
    });

    it('should output the appropriate tokens for JSX tags', () => {
      expect(collectTokens('const Foo = () => <div>foo</div>;')).toMatchSnapshot();
    });

    it('should output the appropriate tokens for RegEx patterns', () => {
      expect(collectTokens('const pattern = /pat/;')).toMatchSnapshot();
    });

    it('should output the appropriate tokens for comments', () => {
      expect(collectTokens('const foo = \'bar\'; // yep!')).toMatchSnapshot();
      expect(collectTokens('/* This is a comment */')).toMatchSnapshot();
    });

    it('should output the appropriate tokens for a more complex program', () => {
      expect(collectTokens(sampleProgram)).toMatchSnapshot();
    });
  });
});

describe('Line', () => {
  it('should render children if no tokens are provided', () => {
    expect(
      renderer.create(<Line tokens={[]}>Hello, world!</Line>).toJSON(),
    ).toMatchSnapshot();
  });

  it('should render tokens if provided', () => {
    const tokens = [
      {
        type: 'declaration',
        value: 'const',
      },
      {
        value: ' ',
      },
      {
        type: 'name',
        value: 'foo',
      },
      {
        type: 'operator',
        value: '=',
      },
      {
        type: 'value',
        value: '\'bar\'',
      },
      {
        type: 'comment',
        value: ';',
      },
    ];
    expect(
      renderer.create(
        <Line tokens={tokens}>
          {'const foo = \'bar\';'}
        </Line>,
      ).toJSON(),
    ).toMatchSnapshot();
  });
});

describe('mapTokens', () => {
  it('should collect tokens from children and provide them as a prop', () => {
    const props = mapTokens({ children: 'const foo = \'bar\';' });
    expect(props).toEqual({
      children: 'const foo = \'bar\';',
      tokens: [{
        type: 'declaration',
        value: 'const',
      }, {
        value: ' ',
      }, {
        type: 'name',
        value: 'foo',
      }, {
        value: ' ',
      }, {
        type: 'operator',
        value: '=',
      }, {
        value: ' ',
      }, {
        type: 'value',
        value: '\'bar\'',
      }, {
        type: 'comment',
        value: ';',
      }],
    });
  });
});

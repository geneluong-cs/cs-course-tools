import { describe, it, expect } from 'vitest'
import { getFirstWord, getSecondWord } from '../NamingConventions';

describe('getFirstWord', () => {
  it('just one word, returns the same word', () => {
    const name = 'bob';
    const res = getFirstWord(name);

    expect(res).toEqual(name);
  });

  it('two words, returns the first word', () => {
    const name = 'bob jane';
    const res = getFirstWord(name);

    expect(res).toEqual('bob');
  });

  it('three words, returns the word', () => {
    const name = 'bob jane market';
    const res = getFirstWord(name);

    expect(res).toEqual('bob');
  });
});

describe('getSecondWord', () => {
  it('just one word, returns the same word', () => {
    const name = 'bob';
    const res = getSecondWord(name);

    expect(res).toEqual(name);
  });

  it('two words, returns the second part', () => {
    const name = 'bob jane';
    const res = getSecondWord(name);

    expect(res).toEqual('jane');
  });

  it('three words, returns the second and third part', () => {
    const name = 'bob jane market';
    const res = getSecondWord(name);

    expect(res).toEqual('jane market');
  });
});
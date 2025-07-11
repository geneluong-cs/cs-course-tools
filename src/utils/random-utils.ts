export interface IRandom {
  next: () => number;
}

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
export function random(seed: number): IRandom {
  var m_w = 123456789;
  var m_z = 987654321;
  var mask = 0xffffffff;


  // Takes any integer
  function init(i: number) {
    m_w = (123456789 + i) & mask;
    m_z = (987654321 - i) & mask;
  }

  init(seed);

  // Returns number between 0 (inclusive) and 1.0 (exclusive),
  // just like Math.random().
  function random()
  {
      m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
      m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
      var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
      result /= 4294967296;
      return result;
  }
  return {
    next: random
  };
};
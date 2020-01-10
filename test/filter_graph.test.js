const chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  sinon = require('sinon');

const FilterGraph = require('../lib/filter_graph');
const FilterNode = require('../lib/filter_node');
const FilterChain = require('../lib/filter_chain');
const FFmpegInput = require('../lib/ffmpeg_input');

describe('FilterGraph', function () {
  this.beforeEach(() => {
    scaleFilter = new FilterNode('scale', [640, -1])
    subtitlesFilter = new FilterNode('subtitles', {
      filename: 'subtitles.srt'
    })
    alimiterFilter = new FilterNode('alimiter', { limit: 0.8 })
    denoiserFilter = new FilterNode('atadenoise', { s: 31 })
    video = new FFmpegInput(
      '/sources/2018S-RES0601-S02-DMX.mov',
      { 'ss': 5110.77 }
    )
    delayedAudio = new FFmpegInput(
      '/sources/2018S-RES0601-S02-DMX.mov',
      { 'itsoffset': 0.33, 'ss': 5110.77 }
    )
    videoFilters = new FilterChain([
      scaleFilter, subtitlesFilter
    ])
    videoFilters.addInput(video.streamSpecifier('v'))
    audioFilters = new FilterChain([
      alimiterFilter, denoiserFilter
    ])
    audioFilters.addInput(delayedAudio.streamSpecifier('a'))
  });

  describe('creates a filter graph', function () {
    it('creates a FilterGraph', () => {
      const fg = new FilterGraph();
      expect(fg).to.be.instanceof(FilterGraph);
    });
  })
  describe('addFilterChain()', () => {
    it('allows adding filter chains', () => {
      const fg = new FilterGraph();
      expect(fg.chains).to.be.instanceof(Array);
      expect(fg.chains.length).to.eql(0)
      fg.addFilterChain(videoFilters)
      expect(fg.chains.length).to.eql(1)
      expect(fg.chains[0]).to.eql(videoFilters)
      fg.addFilterChain(audioFilters)
      expect(fg.chains.length).to.eql(2)
      expect(fg.chains[1]).to.eql(audioFilters)
    });
    it('fails on non-FilterChain chains argument', () => {
      expect(() => {
        const f = new FilterGraph()
        f.addFilterChain('abc')
      }).to.throw();
    });
  })
  describe('toString()', () => {
    it('returns the correct string representation', () => {
      const fg = new FilterGraph();
      fg.addFilterChain(videoFilters)
      fg.addFilterChain(audioFilters)
      video.inputLabel = 0
      delayedAudio.inputLabel = 1
      const expected = `[0:v]scale=640:-1,subtitles=filename=subtitles.srt;[1:a]alimiter=limit=0.8,atadenoise=s=31`
      expect(fg.toString()).to.eql(expected)
    })
  })
});

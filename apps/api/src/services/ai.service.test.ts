import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AiService } from '../services/ai.service';

const ai = new AiService();

describe('AiService', () => {
  it('generates a summary from title and tags', () => {
    const summary = ai.generateSummary('Neural Streams', 'A deep dive', ['ai', 'tech']);
    assert.ok(summary.includes('Neural Streams'));
    assert.ok(summary.includes('ai'));
  });

  it('detects spammy comments', () => {
    assert.ok(ai.detectSpam('FREE FREE FREE click here BUY NOW') > 0.3);
    assert.ok(ai.detectSpam('Great video, thanks for sharing!') < 0.3);
  });

  it('classifies content from tags', () => {
    assert.equal(ai.classifyContent(['gaming', 'esports']), 'gaming');
    assert.equal(ai.classifyContent(['tutorial', 'learn']), 'education');
  });

  it('builds chapters for long videos', () => {
    const chapters = ai.generateChapters(600, 'Long Talk');
    assert.ok(chapters.length >= 2);
    assert.equal(chapters[0].start, 0);
    assert.ok(chapters[chapters.length - 1].end <= 600);
  });
});

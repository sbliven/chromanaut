import 'mocha';
import {normalize, unnormalize} from '../../src/chromanaut/color';
import {rgb} from 'color-space';
import {expect} from 'chai';

describe('chromanaut/color.js', function() {
    describe('normalize function', function() {
        it('should be reciprocal', function() {
            let input = [128, 5, 200];
            let norm = normalize(rgb, input);
            let unnorm = unnormalize(rgb, norm);
            expect(unnorm).to.eql(input);
        });
    });
});
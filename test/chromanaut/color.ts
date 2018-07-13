import 'mocha';
import {normalize, unnormalize} from './chromanaut/color';
import {rgb} from 'color-space';
import {expect} from 'chai';

describe('normalize function', () => {
    it('should be reciprocal', () => {
        let input = [128, 5, 200];
        let norm = normalize(rgb, input);
        let unnorm = unnormalize(rgb, norm);
        expect(unnorm).to.eql(input);
    });
});

import {describe,it,expect} from 'vitest';
import {academies} from '../content/catalog';
describe('academy catalog',()=>{it('contains ten distinct routed academies with descriptions',()=>{expect(academies).toHaveLength(10);expect(new Set(academies.map(a=>a.id)).size).toBe(10);expect(academies.every(a=>a.description.length>5)).toBe(true);});});

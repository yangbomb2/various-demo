import TestComponent from '../components/test-component';

test('Dummy test component function test', () => {

  let testC = new TestComponent({});

  expect(testC.testFunction(1,2)).toBe(3);

});

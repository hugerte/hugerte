const after = (marker, elements) => {
  elements.forEach((x, i) => {
    const e = i === 0 ? marker : elements[i - 1];
    e.after(x);
  });
}; // from sugar

const parent1 = document.createElement('div');
const marker1 = document.createElement('div');
parent1.append(marker1);
marker1.after(document.createElement('div'), document.createElement('p'), document.createTextNode(''), document.createComment(''), document.createElement('a'));

const parent2 = document.createElement('div');
const marker2 = document.createElement('div');
parent2.append(marker2);
after(marker2, [document.createElement('div'), document.createElement('p'), document.createTextNode(''), document.createComment(''), document.createElement('a')]);

console.log(parent1);
console.log(parent2);

// identical :)


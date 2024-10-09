# CheckBox-JS
[![version](https://img.shields.io/npm/v/@carry0987/check-box.svg)](https://www.npmjs.com/package/@carry0987/check-box)
![CI](https://github.com/carry0987/CheckBox-JS/actions/workflows/ci.yml/badge.svg)  
A library for create and manage checkbox elements

## Installation
```bash
pnpm i @carry0987/check-box
```

## Usage
Here is a simple example to use CheckBox-JS

#### UMD
```html
<div id="app">
    <input type="checkbox" id="check-all" title="Check All">
    <div class="check-box-list">
        <input type="checkbox" name="check-no-title" checked>
        <input type="checkbox" name="check-1" data-checkbox-id="check-1" value="Test-1">
        <label data-checkbox-for="check-1" class="test">Check-1</label>
        <input type="checkbox" name="check-2" id="check-2" value="Test-2">
        <label for="check-2">Check-2</label>
        <input type="checkbox" name="check-3" id="check-3" value="Test-3">
        <label for="check-3">Check-3</label>
    </div>
    <input type="checkbox" id="check-all-2" title="Check All">
</div>
<script src="dist/checkBox.min.js"></script>
<script type="text/javascript">
let checkBox = new checkBoxjs.CheckBox('#app .check-box-list input', {
    bindLabel: true,
    checkAll: ['#check-all', '#check-all-2'],
    allowShiftKey: true,
    onChange: (total, target) => {
        console.log(target);
        if (target) console.log(target);
    },
    onCheckAll: (total) => {
        console.log(total);
    },
    styles: {
        '#check-all ~ label': {
            fontWeight: 'bold'
        }
    }
});
checkBox.onChange = (total, target) => {
    console.log('Total: ', total);
    if (target) console.log(target);
};
document.getElementById('version').innerText = checkBoxjs.CheckBox.version;
</script>
```

#### ES Module
```ts
import { CheckBox } from '@carry0987/check-box';

let checkBox = new CheckBox('#app .check-box-list input', {
    //...
});
```

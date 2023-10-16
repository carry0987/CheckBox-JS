import Util from './util';
import throwError from './error';
import reportInfo from './report';
import './checkBox.css';

class CheckBox {
    constructor(elements, option = {}) {
        this.init(elements, option, CheckBox.instance.length);
        CheckBox.instance.push(this);

        if (CheckBox.instance.length === 1) reportInfo('CheckBox is loaded, version:' + CheckBox.version);
    }

    static destroyAll() {
        CheckBox.instance.forEach((instance) => {
            instance.destroy();
        });
        CheckBox.instance = [];
    }

    init(elements, option, id) {
        let elem = Util.getElem(elements, 'all');
        if (!elem || elem.length < 1) throwError('Cannot find elements : ' + elements);
        this.id = id;
        this.element = elements;
        this.allElement = []; // Store all elements here which will be used in destroy method
        this.option = Util.deepMerge({}, CheckBox.defaultOption, option);
        this.total = {
            checked: [],
            list: [],
            input: [],
            row: 0
        };
        // Inject stylesheet
        if (this.option?.styles && Object.keys(this.option.styles).length > 0) {
            let styles = Util.deepMerge({}, this.option.styles);
            Util.injectStylesheet(styles, this.id);
        }
        // Handle onChange event
        Util.toggleCheckAll(this.option.checkAll, this.total);
        this.onChange = (total) => {if (this.option?.onChange) this.option.onChange(total)};

        // Handle checkbox
        elem.forEach((ele, index) => {
            if (ele.type !== 'checkbox') return;
            if (ele.hasAttribute('data-checkbox')) return;
            ele.setAttribute('data-checkbox', 'true');

            // Handle checkbox title
            let labelSibling = ele.nextElementSibling;
            let title = ele?.title || ele?.dataset?.checkboxTitle;
            let bindLabel = this.option.bindLabel;
            let ramainLabel = false,
                randomID = null;
            if (labelSibling && labelSibling.tagName === 'LABEL') {
                title = (() => { // using IIFE
                    if (!Util.isEmpty(ele.id)) {
                        if (labelSibling.htmlFor === ele.id) {
                            bindLabel = ramainLabel = true;
                            return true;
                        }
                        if (labelSibling.dataset?.checkboxFor === ele.id) {
                            return true;
                        }
                    }
                    if (ele.dataset?.checkboxId && labelSibling.dataset?.checkboxFor === ele.dataset?.checkboxId) {
                        randomID = Util.isEmpty(ele.id) && Util.isEmpty(labelSibling.htmlFor) ? 'check-' + Util.createUniqueID(6) : null;
                        return true;
                    }
                    return null;
                })();
                if (title === true) {
                    title = labelSibling.textContent;
                    labelSibling.parentNode.removeChild(labelSibling);
                }
            }

            // Handle checkbox checked status
            if (ele.checked) {
                ele.setAttribute('checked', 'checked');
            } else {
                if (this.option?.checked) {
                    if (typeof this.option.checked === 'boolean' && elem.length === 1) {
                        ele.checked = true;
                        ele.setAttribute('checked', 'checked');
                    }
                    if ((ele?.value === this.option.checked) || (index === this.option.checked)) {
                        ele.checked = true;
                        ele.setAttribute('checked', 'checked');
                    }
                    if (typeof this.option.checked === 'string') {
                        this.option.checked = [this.option.checked];
                    }
                    if (Array.isArray(this.option.checked)) {
                        if (this.option.checked.includes(ele.name) || this.option.checked.includes(ele.id)) {
                            ele.checked = true;
                            ele.setAttribute('checked', 'checked');
                        }
                    }
                }
            }

            // Insert checkbox
            let template = Util.getTemplate(this.id);
            let templateNode = document.createElement('div');
            templateNode.innerHTML = template.trim();
            let labelNode = Util.getElem('label', templateNode);
            let cloneEle = ele.cloneNode(true);
            if (randomID) {
                cloneEle.removeAttribute('data-checkbox-id');
                cloneEle.id = randomID;
                labelNode.htmlFor = randomID;
            }
            if (ramainLabel === true) {
                labelNode.htmlFor = cloneEle.id;
            }
            labelNode.parentNode.insertBefore(cloneEle, labelNode);
            ele.parentNode.replaceChild(templateNode.firstElementChild, ele);

            // Insert checkbox title
            if (title === null) {
                labelNode.parentNode.removeChild(labelNode);
            } else {
                labelNode.textContent = title;
                if (bindLabel) {
                    labelNode.classList.add('checkbox-labeled');
                    labelNode.addEventListener('click', (e) => {
                        e.preventDefault();
                        cloneEle.click();
                    });
                }
            }

            // Add event listener
            cloneEle.addEventListener('change', (e) => {
                this.checkBoxChange();
            });
            this.allElement.push(cloneEle); // Store each checkbox element
        });
        //Handle checkAll checkbox
        if (this.option?.checkAll) {
            const checkAll = Util.getElem(this.option.checkAll);
            if (checkAll && this.allElement.length) {
                checkAll.addEventListener('change', (e) => {
                    const checked = e.target.checked; 
                    this.allElement.forEach((ele) => {
                        ele.checked = checked;
                        checked ? ele.setAttribute('checked', 'checked') : ele.removeAttribute('checked');
                    });
                    this.checkBoxChange();
                });
            }
        }

        return this;
    }

    checkBoxChange() {
        const total = this.total;
        let selector = this.element + ' input[type=checkbox]:checked';
        total.checked = Array.from(Util.getElem(selector, 'all'));
        total.list = [];
        total.input = [];
        total.checked.forEach((checkbox) => {
            total.list.push(checkbox.value);
            total.input.push(checkbox);
        });
        total.checked = total.checked.length;
        selector = this.element + ' input[type=checkbox]';
        total.row = Util.getElem(selector, 'all').length;
        Util.toggleCheckAll(this.option.checkAll, total);
        this.onChange(total);
        const event = Util.createEvent('checkbox-change');
        event.total = total;
        document.dispatchEvent(event);
    }

    getCheckBox() {
        return this.total;
    }

    refresh() {
        this.init(this.element, this.option);
    }

    destroy() {
        //Remove event listeners from all elements
        this.allElement.forEach(element => {
            element.removeEventListener('change', this.checkBoxChange);
            element.removeEventListener('change', this.onChange);
            element.removeEventListener('change', this.option.onChange);
        });
        Util.removeStylesheet(this.id);
        CheckBox.instance.splice(this.id, 1);

        return this;
    }
}

CheckBox.version = '__version__';
CheckBox.instance = [];
CheckBox.defaultOption = {
    checkAll: null, // Selector of the checkbox which is used to check all checkboxes
    onChange: null,
    onCheckAll: null,
    bindLabel: true,
    styles: {}
};

export default CheckBox;

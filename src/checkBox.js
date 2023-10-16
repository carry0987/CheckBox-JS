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
            checked: [], // Store all checked checkbox
            list: [], // Store all checked checkbox value
            input: [] // Store all checkbox element
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
            let bindLabel = this.option.bindLabel;
            let [title, ramainLabel, randomID] = Util.handleCheckboxTitle(ele, labelSibling);
            bindLabel = ramainLabel === true ? true : bindLabel;
            if (title === true) {
                title = labelSibling.textContent;
                labelSibling.parentNode.removeChild(labelSibling);
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
            let [cloneEle, templateNode, labelNode] = Util.insertCheckbox(this.id, ele, randomID, ramainLabel);
            ele.parentNode.replaceChild(templateNode.firstElementChild, ele);

            // Insert checkbox title
            Util.insertCheckboxTitle(title, bindLabel, labelNode, cloneEle);

            // Add event listener
            cloneEle.addEventListener('change', (e) => {
                this.checkBoxChange();
            });
            this.allElement.push(cloneEle); // Store each checkbox element
        });
        //Handle checkAll checkbox
        if (this.option?.checkAll) {
            const checkAll = Util.getElem(this.option.checkAll);
            if (checkAll) {
                checkAll.addEventListener('change', (e) => {
                    this.checkBoxChange();
                });
            }
        }

        return this;
    }

    checkBoxChange() {
        const total = this.total;
        total.list = [];
        total.input = [];
        total.checked = [];
        this.allElement.forEach((checkbox) => {
            total.input.push(checkbox);
            if (checkbox.checked) {
                total.list.push(checkbox.value);
                total.checked.push(checkbox);
            }
        });
        Util.toggleCheckAll(this.option.checkAll, total);
        this.onChange(total);

        // Dispatch custom event
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
        //Clear all elements
        this.allElement = [];
        this.total = {};
        //Remove stylesheet
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

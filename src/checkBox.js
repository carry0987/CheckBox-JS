import Utils from './utils-ext';
import reportInfo from './report';
import './checkBox.css';

class CheckBox {
    constructor(elements, option = {}) {
        if (typeof CheckBox.firstLoad === 'undefined') CheckBox.firstLoad = true;
        this.init(elements, option, CheckBox.instance.length);
        CheckBox.instance.push(this);

        if (CheckBox.instance.length === 1 && CheckBox.firstLoad === true) reportInfo('CheckBox is loaded, version:' + CheckBox.version);
    }

    static destroyAll() {
        CheckBox.instance.forEach((instance) => {
            instance.destroy();
        });
        CheckBox.instance = [];
    }

    init(elements, option, id) {
        let elem = Utils.getElem(elements, 'all');
        if (!elem || elem.length < 1) Utils.throwError('Cannot find elements : ' + elements);
        this.id = id;
        this.element = elements;
        this.allElement = []; // Store all elements here which will be used in destroy method
        this.option = Utils.deepMerge({}, CheckBox.defaultOption, option);
        this.total = {
            checked: [], // Store all checked checkbox
            list: [], // Store all checked checkbox value
            input: [] // Store all checkbox element
        };
        // Inject stylesheet
        let styles = {};
        if (this.option?.checkMark) {
            styles = {
                '.check-box input[type=checkbox] + .checkmark:after': {
                    'background-image': 'url(' + this.option.checkMark + ')'
                }
            };
        }
        if (this.option?.styles && Object.keys(this.option.styles).length > 0) {
            styles = Utils.deepMerge({}, this.option.styles, styles);
        }
        styles && Utils.injectStylesheet(styles, this.id);

        // Handle onChange event
        this.onChange = (total, target) => {if (this.option?.onChange) this.option.onChange(total, target)};
        this.onCheckAll = (checkedAll) => {if (this.option?.onCheckAll) this.option.onCheckAll(checkedAll)};

        // Handle checkbox
        elem.forEach((ele, index) => {
            if (ele.type !== 'checkbox') return;
            if (ele.hasAttribute('data-checkbox')) return;
            ele.setAttribute('data-checkbox', 'true');

            // Handle checkbox title
            let labelSibling = ele.nextElementSibling;
            let bindLabel = this.option.bindLabel;
            let [title, ramainLabel, randomID, isValidLabel] = Utils.handleCheckboxTitle(ele, labelSibling);
            bindLabel = ramainLabel === true ? true : bindLabel;
            if (title === true) {
                title = labelSibling.textContent;
                labelSibling.parentNode.removeChild(labelSibling);
            }

            // Handle checkbox checked status
            if (ele.checked) {
                Utils.toggleCheckStatus(ele, true);
            } else {
                if (this.option?.checked) {
                    if (typeof this.option.checked === 'boolean' && elem.length === 1) {
                        Utils.toggleCheckStatus(ele, true);
                    }
                    if ((ele?.value === this.option.checked) || (index === this.option.checked)) {
                        Utils.toggleCheckStatus(ele, true);
                    }
                    if (typeof this.option.checked === 'string') {
                        this.option.checked = [this.option.checked];
                    }
                    if (Array.isArray(this.option.checked)) {
                        if (this.option.checked.includes(ele.name) || this.option.checked.includes(ele.id)) {
                            Utils.toggleCheckStatus(ele, true);
                        }
                    }
                }
            }

            // Insert checkbox
            let [cloneEle, templateNode, labelNode] = Utils.insertCheckbox(this.id, ele, randomID, ramainLabel);
            ele.parentNode.replaceChild(templateNode.firstElementChild, ele);

            // Insert checkbox title
            Utils.insertCheckboxTitle(title, bindLabel, labelNode, cloneEle);

            // Add event listener
            let checkBoxChange = this.checkBoxChange.bind(this, true, cloneEle);
            cloneEle.addEventListener('change', checkBoxChange);
            cloneEle.checkBoxChange = checkBoxChange;

            // Store each checkbox element
            cloneEle.isValidLabel = isValidLabel;
            this.allElement.push(cloneEle);
        });
        // Handle checkAll checkbox
        if (this.option?.checkAll) {
            const checkAll = Utils.getElem(this.option.checkAll);
            if (checkAll && checkAll?.type === 'checkbox') {
                if (checkAll.hasAttribute('data-checkbox')) return;
                checkAll.setAttribute('data-checkbox', 'true');
                let labelSibling = checkAll.nextElementSibling;
                let bindLabel = this.option?.bindLabel;
                let [title, ramainLabel, randomID, isValidLabel] = Utils.handleCheckboxTitle(checkAll, labelSibling);
                bindLabel = ramainLabel === true ? true : bindLabel;
                if (title === true) {
                    title = labelSibling.textContent;
                    labelSibling.parentNode.removeChild(labelSibling);
                }
                let [cloneEle, templateNode, labelNode] = Utils.insertCheckbox(this.id, checkAll, randomID, ramainLabel);
                checkAll.parentNode.replaceChild(templateNode.firstElementChild, checkAll);
                Utils.insertCheckboxTitle(title, bindLabel, labelNode, cloneEle);
                let checkAllChange = ((e) => {
                    const checkedAll = e.target.checked;
                    this.allElement.forEach((checkbox) => {
                        Utils.toggleCheckStatus(checkbox, checkedAll);
                    });
                    this.checkBoxChange(false);
                    this.onCheckAll(checkedAll);
                }).bind(this);
                cloneEle.addEventListener('change', checkAllChange);
                cloneEle.checkAllChange = checkAllChange;
                cloneEle.isValidLabel = isValidLabel;
                this.checkAll = cloneEle;
            }
        }

        return this;
    }

    checkBoxChange(toggleCheckAll, target = null) {
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
        toggleCheckAll && Utils.toggleCheckAll(this.option.checkAll, total);
        this.onChange(total, target);
        target && Utils.toggleCheckStatus(target, target.checked);

        // Dispatch custom event
        const customEvent = Utils.createEvent('checkbox-change', { detail: total });
        Utils.dispatchEvent(customEvent);
    }

    getCheckBox() {
        return this.total;
    }

    refresh() {
        this.init(this.element, this.option);
    }

    destroy() {
        CheckBox.firstLoad = false;
        // Remove event listeners from all elements
        this.allElement.forEach(element => {
            Utils.restoreElement(element);
        });
        // Clear the checkAll event if it is used
        if (this.checkAll) {
            Utils.toggleCheckAll(this.checkAll, false);
            Utils.restoreElement(this.checkAll);
        }
        // Clear all elements
        this.allElement = [];
        this.total = {};
        // Remove stylesheet
        Utils.removeStylesheet(this.id);
        CheckBox.instance.splice(this.id, 1);

        return this;
    }
}

CheckBox.version = '__version__';
CheckBox.instance = [];
CheckBox.defaultOption = {
    checked: null, // Default checked checkbox, can be boolean, string, number or array
    // Image url of the check mark, default is a base64 image
    checkMark: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMCA2IDkgMTcgNCAxMiI+PC9wb2x5bGluZT48L3N2Zz4=',
    checkAll: null, // Selector of the checkbox which is used to check all checkboxes
    onChange: null,
    onCheckAll: null,
    bindLabel: true,
    styles: {}
};

export default CheckBox;

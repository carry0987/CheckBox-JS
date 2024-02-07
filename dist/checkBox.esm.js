function reportError(...error) {
    console.error(...error);
}
function throwError(message) {
    throw new Error(message);
}

var errorUtils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    reportError: reportError,
    throwError: throwError
});

function getElem(ele, mode, parent) {
    // Return generic Element type or NodeList
    if (typeof ele !== 'string')
        return ele;
    let searchContext = document;
    if (mode === null && parent) {
        searchContext = parent;
    }
    else if (mode && mode instanceof Node && 'querySelector' in mode) {
        searchContext = mode;
    }
    else if (parent && parent instanceof Node && 'querySelector' in parent) {
        searchContext = parent;
    }
    // If mode is 'all', search for all elements that match, otherwise, search for the first match
    // Casting the result as E or NodeList
    return mode === 'all' ? searchContext.querySelectorAll(ele) : searchContext.querySelector(ele);
}
function createElem(tagName, attrs = {}, text = '') {
    let elem = document.createElement(tagName);
    for (let attr in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, attr)) {
            if (attr === 'textContent' || attr === 'innerText') {
                elem.textContent = attrs[attr];
            }
            else {
                elem.setAttribute(attr, attrs[attr]);
            }
        }
    }
    if (text)
        elem.textContent = text;
    return elem;
}

let stylesheetId = 'utils-style';
const replaceRule = {
    from: '.utils',
    to: '.utils-'
};
function isObject(item) {
    return typeof item === 'object' && item !== null && !Array.isArray(item);
}
function deepMerge(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (source) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const sourceKey = key;
                const value = source[sourceKey];
                const targetKey = key;
                if (isObject(value)) {
                    if (!target[targetKey] || typeof target[targetKey] !== 'object') {
                        target[targetKey] = {};
                    }
                    deepMerge(target[targetKey], value);
                }
                else {
                    target[targetKey] = value;
                }
            }
        }
    }
    return deepMerge(target, ...sources);
}
function setStylesheetId(id) {
    stylesheetId = id;
}
function setReplaceRule(from, to) {
    replaceRule.from = from;
    replaceRule.to = to;
}
// CSS Injection
function injectStylesheet(stylesObject, id = null) {
    id = isEmpty(id) ? '' : id;
    // Create a style element
    let style = createElem('style');
    // WebKit hack
    style.id = stylesheetId + id;
    style.textContent = '';
    // Add the style element to the document head
    document.head.append(style);
    let stylesheet = style.sheet;
    for (let selector in stylesObject) {
        if (stylesObject.hasOwnProperty(selector)) {
            compatInsertRule(stylesheet, selector, buildRules(stylesObject[selector]), id);
        }
    }
}
function buildRules(ruleObject) {
    let ruleSet = '';
    for (let [property, value] of Object.entries(ruleObject)) {
        property = property.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
        ruleSet += `${property}:${value};`;
    }
    return ruleSet;
}
function compatInsertRule(stylesheet, selector, cssText, id = null) {
    id = isEmpty(id) ? '' : id;
    let modifiedSelector = selector.replace(replaceRule.from, replaceRule.to + id);
    stylesheet.insertRule(modifiedSelector + '{' + cssText + '}', 0);
}
function removeStylesheet(id = null) {
    const styleId = isEmpty(id) ? '' : id;
    let styleElement = getElem('#' + stylesheetId + styleId);
    if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
    }
}
function isEmpty(str) {
    if (typeof str === 'number') {
        return false;
    }
    return !str || (typeof str === 'string' && str.length === 0);
}
function generateRandom(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}

function addEventListener(...params) {
    const [element, eventName, handler, options] = params;
    element.addEventListener(eventName, handler, options);
}
function removeEventListener(...params) {
    const [element, eventName, handler, options] = params;
    element.removeEventListener(eventName, handler, options);
}
function createEvent(eventName, detail, options) {
    return new CustomEvent(eventName, { detail, ...options });
}
function dispatchEvent(eventOrName, element = document, detail, options) {
    try {
        if (typeof eventOrName === 'string') {
            let event = createEvent(eventOrName, detail, options);
            return element.dispatchEvent(event);
        }
        else if (eventOrName instanceof Event) {
            return element.dispatchEvent(eventOrName);
        }
        else {
            throwError('Invalid event type');
        }
    }
    catch (e) {
        reportError('Dispatch Event Error:', e);
        return false;
    }
}

var eventUtils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    addEventListener: addEventListener,
    createEvent: createEvent,
    dispatchEvent: dispatchEvent,
    removeEventListener: removeEventListener
});

class Utils {
    static throwError = errorUtils.throwError;
    static getElem = getElem;
    static deepMerge = deepMerge;
    static generateRandom = generateRandom;
    static injectStylesheet = injectStylesheet;
    static removeStylesheet = removeStylesheet;
    static setStylesheetId = setStylesheetId;
    static setReplaceRule = setReplaceRule;
    static isEmpty = isEmpty;
    static createEvent = eventUtils.createEvent;
    static dispatchEvent = eventUtils.dispatchEvent;
    static getTemplate(id) {
        id = id.toString();
        let template = `
        <div class="checkbox check-box-${id}">
            <span class="checkmark"></span>
            <label class="checkbox-label"></label>
        </div>
        `;
        return template;
    }
    static handleCheckboxTitle(ele, labelSibling) {
        let title = ele.title || ele.dataset.checkboxTitle || null;
        let remainLabel = false;
        let randomID = null;
        let isValidLabel = false;
        let labelToRestore;
        if (labelSibling instanceof HTMLLabelElement) {
            const htmlFor = labelSibling.htmlFor;
            const dataCheckboxFor = labelSibling.dataset.checkboxFor;
            const dataCheckboxId = ele.dataset.checkboxId;
            remainLabel = !Utils.isEmpty(ele.id) && htmlFor === ele.id;
            isValidLabel = !Utils.isEmpty(ele.id) && (dataCheckboxFor === ele.id);
            if (!Utils.isEmpty(dataCheckboxId) && dataCheckboxFor === dataCheckboxId) {
                randomID = Utils.isEmpty(ele.id) && Utils.isEmpty(htmlFor) ? 'check-' + Utils.generateRandom(6) : null;
                isValidLabel = true;
            }
            if (isValidLabel || remainLabel) {
                labelToRestore = labelSibling.cloneNode(true);
                // Prefer the explicitly set title, fall back to text from the label.
                title = title || labelSibling.textContent;
                // Remove the original label
                labelSibling.parentNode.removeChild(labelSibling);
            }
        }
        return { title, remainLabel, randomID, labelToRestore };
    }
    static insertCheckbox(id, ele, randomID, remainLabel) {
        let template = Utils.getTemplate(id);
        let templateNode = createElem('div');
        templateNode.innerHTML = template.trim();
        let checkmarkNode = getElem('.checkmark', templateNode);
        let labelNode = getElem('label', templateNode);
        let cloneEle = ele.cloneNode(true);
        cloneEle.withID = true;
        if (randomID) {
            cloneEle.id = randomID;
            cloneEle.withID = false;
        }
        if (remainLabel === true) {
            labelNode.htmlFor = cloneEle.id;
        }
        checkmarkNode.addEventListener('click', (e) => {
            e.preventDefault();
            cloneEle.click();
        });
        if (checkmarkNode.parentNode) {
            checkmarkNode.parentNode.insertBefore(cloneEle, checkmarkNode);
        }
        // Replace the original element with the new one
        ele.parentNode.replaceChild(templateNode.firstElementChild || templateNode, ele);
        return { cloneEle, templateNode, labelNode };
    }
    static insertCheckboxTitle(title, bindLabel, labelNode, cloneEle) {
        if (!title) {
            labelNode.parentNode.removeChild(labelNode);
        }
        else {
            labelNode.textContent = title;
            if (bindLabel === true) {
                labelNode.classList.add('checkbox-labeled');
                labelNode.addEventListener('click', (e) => {
                    e.preventDefault();
                    cloneEle.click();
                });
            }
        }
    }
    static toggleCheckStatus(ele, checked) {
        if (checked) {
            ele.checked = true;
            ele.setAttribute('checked', 'checked');
        }
        else {
            ele.checked = false;
            ele.removeAttribute('checked');
        }
    }
    static toggleCheckAll(ele, total) {
        let checkAll = getElem(ele);
        if (!checkAll)
            return;
        if (total && total.checked && total.input) {
            Utils.toggleCheckStatus(checkAll, (total.checked.length !== total.input.length || total.checked.length === 0) === false);
        }
        else {
            Utils.toggleCheckStatus(checkAll, false);
        }
    }
    static restoreElement(element) {
        if (typeof element.checkBoxChange === 'function') {
            element.removeEventListener('change', element.checkBoxChange);
        }
        if (element.withID === false) {
            element.removeAttribute('id');
        }
        element.checkBoxChange = undefined;
        element.removeAttribute('data-checkbox');
        if (element.parentNode) {
            let parentElement = element.parentNode;
            parentElement.replaceWith(element);
        }
        let labelNode = element.labelToRestore;
        if (labelNode && labelNode.nodeType === Node.ELEMENT_NODE) {
            element.parentNode?.insertBefore(labelNode, element.nextSibling);
        }
    }
}
Utils.setStylesheetId('checkbox-style');
Utils.setReplaceRule('.check-box', '.check-box-');

const reportInfo = (vars, showType = false) => {
    if (showType === true) {
        console.log('Data Type : ' + typeof vars, '\nValue : ' + vars);
    }
    else if (typeof showType !== 'boolean') {
        console.log(showType);
    }
    else {
        console.log(vars);
    }
};

const defaults = {
    checked: undefined,
    checkMark: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMCA2IDkgMTcgNCAxMiI+PC9wb2x5bGluZT48L3N2Zz4=',
    checkAll: undefined,
    bindLabel: true,
    onChange: undefined,
    onCheckAll: undefined,
    styles: {}
};

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "/* Checkbox */\n.checkbox {\n    display: flex;\n    align-items: center;\n    margin: 5px 0;\n}\n\n.checkbox input[type=\"checkbox\"] {\n    position: relative;\n    border: none;\n    -webkit-appearance: none;\n    appearance: none;\n    cursor: pointer;\n    margin: 0;\n    width: auto;\n    height: auto;\n}\n\n.checkbox input[type=\"checkbox\"]:focus {\n    outline: none;\n}\n\n.checkmark {\n    cursor: pointer;\n    width: 20px;\n    height: 20px;\n    border: 2px solid #666666;\n    position: relative;\n    background: white;\n    border-radius: 3px;\n    transition: background-color 0.2s linear;\n}\n\n.checkmark::after {\n    content: '';\n    display: block;\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    background-repeat: no-repeat;\n    background-position: center;\n    background-size: contain;\n    opacity: 0;\n    transition: opacity 0.2s linear;\n}\n\n.checkbox input[type=\"checkbox\"]:checked + .checkmark::after,\n.checkbox input[type=\"checkbox\"]:disabled + .checkmark::after {\n    opacity: 1;\n}\n\n.checkbox input[type=\"checkbox\"]:checked + .checkmark {\n    border-color: #2196f3;\n    background-color: #2196f3;\n}\n\n.checkbox input[type=\"checkbox\"]:disabled + .checkmark {\n    cursor: not-allowed;\n    border-color: #999999;\n}\n\n.checkbox input[type=\"checkbox\"]:disabled + .checkmark::after {\n    background-color: #999999;\n}\n\n.checkbox-label {\n    margin-left: 5px;\n}\n\n.checkbox-labeled {\n    cursor: pointer;\n    -webkit-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n    user-select: none;\n}\n";
styleInject(css_248z);

class CheckBox {
    static instances = [];
    static version = '2.0.4';
    static firstLoad = true;
    element = null;
    options;
    id = 0;
    allElement = []; // Store all elements here which will be used in destroy method
    total = { input: [], checked: [], list: [] };
    checkAllElement;
    // Methods for external use
    onChangeCallback;
    onCheckAllCallback;
    constructor(element, option = {}) {
        this.init(element, option, CheckBox.instances.length);
        CheckBox.instances.push(this);
        if (CheckBox.instances.length === 1 && CheckBox.firstLoad === true) {
            reportInfo(`CheckBox is loaded, version: ${CheckBox.version}`);
        }
        // Set firstLoad flag to false
        CheckBox.firstLoad = false;
    }
    init(elements, option, id) {
        let elem = Utils.getElem(elements, 'all');
        if (!elem || elem.length < 1)
            Utils.throwError('Cannot find elements : ' + elements);
        this.id = id;
        this.element = elements;
        this.options = Utils.deepMerge({}, defaults, option);
        // Inject stylesheet
        this.injectStyles();
        // Handle callback events
        this.setupCallbacks();
        // Process each checkbox element
        elem.forEach((ele, index) => this.processCheckbox(ele, index));
        // Set up the check all checkbox, if specified in options
        if (this.options.checkAll) {
            this.setupCheckAll();
        }
        return this;
    }
    injectStyles() {
        // Inject stylesheet
        let styles = {};
        if (this.options?.checkMark) {
            styles = {
                '.check-box input[type=checkbox] + .checkmark:after': {
                    'background-image': 'url(' + this.options.checkMark + ')'
                }
            };
        }
        if (this.options?.styles && Object.keys(this.options.styles).length > 0) {
            styles = Utils.deepMerge({}, this.options.styles, styles);
        }
        styles && Utils.injectStylesheet(styles, this.id.toString());
    }
    setupCallbacks() {
        // Handle onChange event
        this.onChange = (total, target) => { if (this.options?.onChange)
            this.options.onChange(total, target); };
        // Handle onCheckAll event
        this.onCheckAll = (checkedAll) => { if (this.options?.onCheckAll)
            this.options.onCheckAll(checkedAll); };
    }
    processCheckbox(ele, index) {
        if (ele.type !== 'checkbox')
            return;
        if (ele.hasAttribute('data-checkbox'))
            return;
        ele.setAttribute('data-checkbox', 'true');
        // Handle checkbox title
        let labelSibling = ele.nextElementSibling;
        let bindLabel = this.options.bindLabel ?? false;
        let { title, remainLabel, randomID, labelToRestore } = Utils.handleCheckboxTitle(ele, labelSibling);
        bindLabel = remainLabel ? true : bindLabel;
        // Handle checkbox checked status
        if (ele.checked) {
            Utils.toggleCheckStatus(ele, true);
        }
        else {
            if (this.options.checked) {
                // Initialize checkbox checked status based on options
                this.updateCheckboxCheckedStatus(ele, index);
            }
        }
        // Insert checkbox
        let { cloneEle, labelNode } = Utils.insertCheckbox(this.id.toString(), ele, randomID, remainLabel);
        // Insert checkbox title
        Utils.insertCheckboxTitle(title, bindLabel, labelNode, cloneEle);
        // Add event listener
        let checkBoxChange = this.checkBoxChange.bind(this, true, cloneEle);
        cloneEle.addEventListener('change', checkBoxChange);
        cloneEle.checkBoxChange = checkBoxChange;
        this.allElement.push(cloneEle);
        // Store label
        cloneEle.labelToRestore = labelToRestore;
    }
    updateCheckboxCheckedStatus(ele, index) {
        // Logic to determine if a checkbox should be checked based on the provided options
        const checkedOption = this.options.checked;
        // Handle different types of 'checked' option
        if (typeof checkedOption === 'boolean') {
            Utils.toggleCheckStatus(ele, checkedOption);
        }
        else if (typeof checkedOption === 'string' || typeof checkedOption === 'number') {
            if (ele.value === checkedOption.toString() || index === Number(checkedOption)) {
                Utils.toggleCheckStatus(ele, true);
            }
        }
        else if (Array.isArray(checkedOption)) {
            if (checkedOption.includes(ele.value)) {
                Utils.toggleCheckStatus(ele, true);
            }
        }
    }
    setupCheckAll() {
        // Retrieve the check all element
        if (this.options.checkAll === undefined)
            return;
        const checkAll = Utils.getElem(this.options.checkAll);
        if (!checkAll || checkAll.type !== 'checkbox')
            return;
        if (checkAll.hasAttribute('data-checkbox'))
            return;
        checkAll.setAttribute('data-checkbox', 'true');
        // Handle the label associated with the check all checkbox
        const labelSibling = checkAll.nextElementSibling;
        let { title, remainLabel, randomID, labelToRestore } = Utils.handleCheckboxTitle(checkAll, labelSibling);
        // If a title has been found and is true, retrieve the label's content
        if (title && labelSibling && labelSibling.tagName === 'LABEL') {
            title = labelSibling.textContent || title;
            labelSibling.parentNode?.removeChild(labelSibling);
        }
        // Insert the check all checkbox template
        const { cloneEle, templateNode, labelNode } = Utils.insertCheckbox(this.id.toString(), checkAll, randomID, remainLabel);
        // Replace the original checkbox with the new template
        checkAll.parentNode?.replaceChild(templateNode.firstElementChild || templateNode, checkAll);
        // Insert the title for the check all checkbox
        Utils.insertCheckboxTitle(title, this.options.bindLabel ?? false, labelNode, cloneEle);
        // Attach the change event listener to the cloned checkbox
        const checkAllChange = (e) => {
            if (!(e.target instanceof HTMLInputElement))
                return;
            const checkedAll = e.target.checked;
            // Toggle the status for all checkboxes
            this.allElement.forEach((checkbox) => {
                Utils.toggleCheckStatus(checkbox, checkedAll);
            });
            // Update the check all status and invoke the callback
            this.checkBoxChange(false);
            if (this.onCheckAllCallback)
                this.onCheckAllCallback(checkedAll);
        };
        cloneEle.addEventListener('change', checkAllChange);
        cloneEle.checkAllChange = checkAllChange;
        cloneEle.labelToRestore = labelToRestore;
        // Update the stored check all element property
        this.checkAllElement = cloneEle;
        // Set the initial check status based on provided options
        if (this.options.checked === true || checkAll.checked) {
            Utils.toggleCheckStatus(cloneEle, true);
            cloneEle.dispatchEvent(new Event('change'));
        }
    }
    checkBoxChange(toggleCheckAll, target = null) {
        this.updateTotal();
        if (toggleCheckAll) {
            this.updateCheckAllStatus();
        }
        this.onChangeCallback?.(this.total, target);
        if (target) {
            Utils.toggleCheckStatus(target, target.checked);
        }
        this.dispatchCheckboxChangeEvent();
    }
    updateTotal() {
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
    }
    updateCheckAllStatus() {
        if (this.checkAllElement) {
            const totalChecked = this.total.checked.length;
            const totalInputs = this.total.input.length;
            const isAllChecked = totalChecked === totalInputs;
            Utils.toggleCheckStatus(this.checkAllElement, isAllChecked);
        }
    }
    dispatchCheckboxChangeEvent() {
        const customEvent = Utils.createEvent('checkbox-change', { detail: this.total });
        Utils.dispatchEvent(customEvent);
    }
    destroy() {
        // Reset firstLoad flag
        CheckBox.firstLoad = false;
        // Remove event listeners from all elements
        this.allElement.forEach(element => {
            Utils.restoreElement(element);
        });
        // Clear the checkAll event if it exists
        if (this.checkAllElement && this.checkAllElement.checkAllChange) {
            Utils.toggleCheckAll(this.checkAllElement);
            Utils.restoreElement(this.checkAllElement);
        }
        // Reset instance variables
        this.element = null;
        this.options = {};
        this.allElement = [];
        this.total = { input: [], checked: [], list: [] };
        this.checkAllElement = undefined;
        // Remove any injected stylesheets
        Utils.removeStylesheet(this.id.toString());
        // Update the static instances array, removing this instance
        const index = CheckBox.instances.indexOf(this);
        if (index !== -1) {
            CheckBox.instances.splice(index, 1);
        }
    }
    // Methods for external use
    set onChange(callback) {
        this.onChangeCallback = callback;
    }
    set onCheckAll(callback) {
        this.onCheckAllCallback = callback;
    }
    /**
     * Get all checkbox elements
     * @return {EnhancedElement[]} All checkbox elements
     */
    get elements() {
        return this.allElement;
    }
    getCheckBox() {
        return this.total;
    }
    refresh() {
        // Re-initialize the current instance
        if (this.element) {
            this.init(this.element, this.options, this.id);
        }
    }
    static destroyAll() {
        // Call destroy on all instances
        while (CheckBox.instances.length) {
            const instance = CheckBox.instances[0];
            instance.destroy();
        }
    }
}

export { CheckBox as default };

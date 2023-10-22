import reportInfo from './report';

/* Util */
const Util = {
    getElem(ele, mode, parent) {
        if (typeof ele === 'object') {
            return ele;
        } else if (mode === undefined && parent === undefined) {
            return (isNaN(ele * 1)) ? document.querySelector(ele) : document.getElementById(ele);
        } else if (mode === 'all' || mode === null) {
            return (parent === undefined) ? document.querySelectorAll(ele) : parent.querySelectorAll(ele);
        } else if (typeof mode === 'object' && parent === undefined) {
            return mode.querySelector(ele);
        }
    },
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },
    deepMerge(target, ...sources) {
        const source = sources.shift();
        if (!source) return target;
        if (Util.isObject(target) && Util.isObject(source)) {
            for (const key in source) {
                if (Util.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    Util.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return Util.deepMerge(target, ...sources);
    },
    createEvent(name) {
        let evt;
        if (!window.CustomEvent || typeof window.CustomEvent !== 'function') {
            evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(name, false, false, undefined);
        } else {
            evt = new CustomEvent(name);
        }
        return evt;
    },
    injectStylesheet(stylesObject, id) {
        let style = document.createElement('style');
        style.id = 'checkbox-style' + id;
        style.appendChild(document.createTextNode(''));
        document.head.appendChild(style);

        let stylesheet = document.styleSheets[document.styleSheets.length - 1];

        for (let selector in stylesObject) {
            if (stylesObject.hasOwnProperty(selector)) {
                Util.compatInsertRule(stylesheet, selector, Util.buildRules(stylesObject[selector]), id);
            }
        }
    },
    buildRules(ruleObject) {
        let ruleSet = '';
        for (let [property, value] of Object.entries(ruleObject)) {
            property = property.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
            ruleSet += `${property}:${value};`;
        }
        return ruleSet;
    },
    compatInsertRule(stylesheet, selector, cssText, id) {
        let modifiedSelector = selector.replace('.check-box', '.check-box-' + id);
        stylesheet.insertRule(modifiedSelector + '{' + cssText + '}', 0);
    },
    removeStylesheet(id) {
        let styleElement = Util.getElem('#checkbox-style' + id);
        if (styleElement) {
            styleElement.parentNode.removeChild(styleElement);
        }
    },
    createUniqueID(length = 8) {
        return Math.random().toString(36).substring(2, 2 + length);
    },
    getTemplate(id) {
        let template = `
        <div class="checkbox check-box-${id}">
            <span class="checkmark"></span>
            <label class="checkbox-label"></label>
        </div>
        `;
        return template;
    },
    isEmpty(str) {
        return (!str?.length);
    },
    handleCheckboxTitle(ele, labelSibling) {
        let ramainLabel = false, randomID = null, isValidLabel = false;
        let title = ele?.title || ele?.dataset?.checkboxTitle;

        if (labelSibling && labelSibling.tagName === 'LABEL') {
            isValidLabel = labelSibling.cloneNode(true);
            title = (() => { // using IIFE
                if (!Util.isEmpty(ele.id)) {
                    if (labelSibling?.htmlFor === ele.id) {
                        ramainLabel = true;
                        return true;
                    }
                    if (labelSibling?.dataset?.checkboxFor === ele.id) {
                        return true;
                    }
                }
                if (ele?.dataset?.checkboxId && labelSibling?.dataset?.checkboxFor === ele?.dataset?.checkboxId) {
                    randomID = Util.isEmpty(ele.id) && Util.isEmpty(labelSibling.htmlFor) ? 'check-' + Util.createUniqueID(6) : null;
                    return true;
                }
                return null;
            })();
        }
        return [title, ramainLabel, randomID, isValidLabel];
    },
    insertCheckbox(id, ele, randomID, ramainLabel) {
        let template = Util.getTemplate(id);
        let templateNode = document.createElement('div');
        templateNode.innerHTML = template.trim();
        let checkmarkNode = Util.getElem('.checkmark', templateNode);
        let labelNode = Util.getElem('label', templateNode);
        let cloneEle = ele.cloneNode(true);
        if (randomID) {
            cloneEle.id = randomID;
        }
        if (ramainLabel === true) {
            labelNode.htmlFor = cloneEle.id;
        }
        checkmarkNode.addEventListener('click', (e) => {
            e.preventDefault();
            cloneEle.click();
        });
        checkmarkNode.parentNode.insertBefore(cloneEle, checkmarkNode);
        return [cloneEle, templateNode, labelNode];
    },
    insertCheckboxTitle(title, bindLabel, labelNode, cloneEle) {
        if (!title) {
            labelNode.parentNode.removeChild(labelNode);
        } else {
            labelNode.textContent = title;
            if (bindLabel === true) {
                labelNode.classList.add('checkbox-labeled');
                labelNode.addEventListener('click', (e) => {
                    e.preventDefault();
                    cloneEle.click();
                });
            }
        }
    },
    toggleCheckStatus(ele, checked) {
        if (checked) {
            ele.checked = true;
            ele.setAttribute('checked', 'checked');
        } else {
            ele.checked = false;
            ele.removeAttribute('checked');
        }
    },
    toggleCheckAll(ele, total) {
        let checkAll = Util.getElem(ele);
        if (!checkAll) return;
        if (total && total.checked && total.input) {
            Util.toggleCheckStatus(checkAll, (total.checked.length !== total.input.length || total.checked.length === 0) === false);
        } else {
            Util.toggleCheckStatus(checkAll, false);
        }
    }
};

export default Util;

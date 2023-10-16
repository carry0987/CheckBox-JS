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
            <label class="checkbox-label"></label>
        </div>
        `;
        return template;
    },
    isEmpty(str) {
        return (!str?.length);
    },
    handleCheckboxTitle(ele, labelSibling) {
        let ramainLabel = false, randomID = null;
        let title = ele?.title || ele?.dataset?.checkboxTitle;

        if (labelSibling && labelSibling.tagName === 'LABEL') {
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
        return [title, ramainLabel, randomID];
    },
    insertCheckbox(id, ele, randomID, ramainLabel) {
        let template = Util.getTemplate(id);
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
        return [cloneEle, templateNode, labelNode];
    },
    insertCheckboxTitle(title, bindLabel, labelNode, cloneEle) {
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
    },
    toggleCheckAll(ele, total) {
        let checkAll = Util.getElem(ele);
        if (!checkAll) return;
        if (total && total.checked && total.input) {
            checkAll.checked = (total.checked.length !== total.input.length || total.checked.length === 0) ? false : true;
            (checkAll.checked) ? checkAll.setAttribute('checked', 'checked') : checkAll.removeAttribute('checked');
        } else {
            checkAll.checked = false;
            checkAll.removeAttribute('checked');
        }
    }
};

export default Util;

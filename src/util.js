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

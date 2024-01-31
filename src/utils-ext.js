import { getElem, createElem, eventUtils, errorUtils, setStylesheetId, setReplaceRule, isEmpty, deepMerge, generateRandom, injectStylesheet, removeStylesheet } from '@carry0987/utils';

class Utils {
    static throwError = errorUtils.throwError;
    static getElem = getElem;
    static deepMerge = deepMerge;
    static injectStylesheet = injectStylesheet;
    static removeStylesheet = removeStylesheet;
    static setStylesheetId = setStylesheetId;
    static setReplaceRule = setReplaceRule;
    static createEvent = eventUtils.createEvent;
    static dispatchEvent = eventUtils.dispatchEvent;

    static getTemplate = function(id) {
        let template = `
        <div class="checkbox check-box-${id}">
            <span class="checkmark"></span>
            <label class="checkbox-label"></label>
        </div>
        `;
        return template;
    }
    
    static handleCheckboxTitle = function(ele, labelSibling) {
        let ramainLabel = false, randomID = null, isValidLabel = false;
        let title = ele?.title || ele?.dataset?.checkboxTitle;
    
        if (labelSibling && labelSibling.tagName === 'LABEL') {
            isValidLabel = labelSibling.cloneNode(true);
            title = (() => { // using IIFE
                if (!isEmpty(ele.id)) {
                    if (labelSibling?.htmlFor === ele.id) {
                        ramainLabel = true;
                        return true;
                    }
                    if (labelSibling?.dataset?.checkboxFor === ele.id) {
                        return true;
                    }
                }
                if (ele?.dataset?.checkboxId && labelSibling?.dataset?.checkboxFor === ele?.dataset?.checkboxId) {
                    randomID = isEmpty(ele.id) && isEmpty(labelSibling.htmlFor) ? 'check-' + generateRandom(6) : null;
                    return true;
                }
                return null;
            })();
        }
        return [title, ramainLabel, randomID, isValidLabel];
    }
    
    static insertCheckbox = function(id, ele, randomID, ramainLabel) {
        let template = Utils.getTemplate(id);
        let templateNode = createElem('div');
        templateNode.innerHTML = template.trim();
        let checkmarkNode = getElem('.checkmark', templateNode);
        let labelNode = getElem('label', templateNode);
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
    }
    
    static insertCheckboxTitle = function(title, bindLabel, labelNode, cloneEle) {
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
    }
    
    static toggleCheckStatus = function(ele, checked) {
        if (checked) {
            ele.checked = true;
            ele.setAttribute('checked', 'checked');
        } else {
            ele.checked = false;
            ele.removeAttribute('checked');
        }
    }
    
    static toggleCheckAll = function(ele, total) {
        let checkAll = getElem(ele);
        if (!checkAll) return;
        if (total && total.checked && total.input) {
            Utils.toggleCheckStatus(checkAll, (total.checked.length !== total.input.length || total.checked.length === 0) === false);
        } else {
            Utils.toggleCheckStatus(checkAll, false);
        }
    }
    
    static restoreElement = function(element) {
        element.removeEventListener('change', element.checkBoxChange);
        element.checkBoxChange = null;
        element.removeAttribute('data-checkbox');
        let parentElement = element.parentNode;
        parentElement.replaceWith(element);
        let labelNode = element.isValidLabel;
        if (labelNode && labelNode.nodeType === Node.ELEMENT_NODE) {
            element.parentNode.insertBefore(labelNode, element.nextSibling);
        }
    }
}

Utils.setStylesheetId('checkbox-style');
Utils.setReplaceRule('.check-box', '.check-box-');

export default Utils;

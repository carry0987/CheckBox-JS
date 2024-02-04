import {
    getElem,
    createElem,
    eventUtils,
    errorUtils,
    setStylesheetId,
    setReplaceRule,
    isEmpty,
    deepMerge,
    generateRandom,
    injectStylesheet,
    removeStylesheet,
} from '@carry0987/utils';
import { TotalCheckbox } from '../interface/interfaces';

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

    static getTemplate(id: string | number): string {
        id = id.toString();
        let template = `
        <div class='checkbox check-box-${id}'>
            <span class='checkmark'></span>
            <label class='checkbox-label'></label>
        </div>
        `;

        return template;
    }

    static handleCheckboxTitle(
        ele: Element,
        labelSibling: HTMLElement | null
    ): [string | null, boolean, string | null, boolean] {
        let ramainLabel = false,
            randomID = null,
            isValidLabel = false;
        let title = ele?.title || ele?.dataset?.checkboxTitle;

        if (labelSibling && labelSibling.tagName === 'LABEL') {
            isValidLabel = labelSibling.cloneNode(true);
            title = (() => {
                // using IIFE
                if (!isEmpty(ele.id)) {
                    if (labelSibling?.htmlFor === ele.id) {
                        ramainLabel = true;
                        return true;
                    }
                    if (labelSibling?.dataset?.checkboxFor === ele.id) {
                        return true;
                    }
                }
                if (
                    ele?.dataset?.checkboxId &&
                    labelSibling?.dataset?.checkboxFor ===
                        ele?.dataset?.checkboxId
                ) {
                    randomID =
                        isEmpty(ele.id) && isEmpty(labelSibling.htmlFor)
                            ? 'check-' + generateRandom(6)
                            : null;
                    return true;
                }
                return null;
            })();
        }
        return [title, ramainLabel, randomID, isValidLabel];
    }

    static insertCheckbox(
        id: string,
        ele: HTMLInputElement,
        randomID: string | null,
        ramainLabel: boolean
    ): [HTMLInputElement, HTMLElement, HTMLLabelElement] {
        let template = Utils.getTemplate(id);
        let templateNode = createElem('div') as HTMLElement;
        templateNode.innerHTML = template.trim();
        let checkmarkNode = getElem('.checkmark', templateNode) as HTMLElement;
        let labelNode = getElem('label', templateNode) as HTMLLabelElement;
        let cloneEle = ele.cloneNode(true) as HTMLInputElement;
        if (randomID) {
            cloneEle.id = randomID;
        }
        if (ramainLabel === true) {
            labelNode.htmlFor = cloneEle.id;
        }
        checkmarkNode.addEventListener('click', (e: Event) => {
            e.preventDefault();
            cloneEle.click();
        });
        checkmarkNode.parentNode!.insertBefore(cloneEle, checkmarkNode);

        return [cloneEle, templateNode, labelNode];
    }

    static insertCheckboxTitle(
        title: string | null,
        bindLabel: boolean,
        labelNode: HTMLLabelElement,
        cloneEle: HTMLInputElement
    ): void {
        if (!title) {
            labelNode.parentNode!.removeChild(labelNode);
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

    static toggleCheckStatus(ele: HTMLInputElement, checked: boolean): void {
        if (checked) {
            ele.checked = true;
            ele.setAttribute('checked', 'checked');
        } else {
            ele.checked = false;
            ele.removeAttribute('checked');
        }
    }

    static toggleCheckAll(ele: string, total: TotalCheckbox): void {
        let checkAll = getElem(ele) as HTMLInputElement;
        if (!checkAll) return;
        if (total && total.checked && total.input) {
            Utils.toggleCheckStatus(
                checkAll,
                (total.checked.length !== total.input.length ||
                    total.checked.length === 0) === false
            );
        } else {
            Utils.toggleCheckStatus(checkAll, false);
        }
    }

    static restoreElement(element: any): void {
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

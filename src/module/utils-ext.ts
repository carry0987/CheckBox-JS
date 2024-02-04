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
import { TotalCheckbox, CheckboxTitleDetails, CheckboxTemplate, EnhancedElement } from '../interface/interfaces';

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
        ele: HTMLElement, 
        labelSibling: HTMLElement | null
    ): CheckboxTitleDetails {
        let title: string | null = null;
        let remainLabel: boolean = false;
        let randomID: string | null = null;
        let isValidLabel: boolean = false;

        // Check if title is available in element's title attribute or data-checkbox-title.
        title = ele.getAttribute('title') || ele.getAttribute('data-checkbox-title');

        // Check for existing label
        if (labelSibling instanceof HTMLLabelElement && labelSibling.tagName === 'LABEL') {
            if (!Utils.isEmpty(ele.id)) {
                if (labelSibling.htmlFor === ele.id) {
                    remainLabel = true;
                } else if (labelSibling.getAttribute('data-checkbox-for') === ele.id) {
                    isValidLabel = true;
                }
            }
            // If no ID is available, or the label is not properly associated, generate a random ID.
            if (Utils.isEmpty(ele.id) || !isValidLabel) {
                randomID = 'check-' + Utils.generateRandom(6);
            }
            // Clone the label element if it's valid.
            isValidLabel = !Utils.isEmpty(labelSibling.htmlFor) || isValidLabel;
        }

        return {title, remainLabel, randomID, isValidLabel};
    }

    static insertCheckbox(
        id: string,
        ele: HTMLInputElement,
        randomID: string | null,
        remainLabel: boolean
    ): CheckboxTemplate {
        let template = Utils.getTemplate(id);
        let templateNode = createElem('div') as HTMLDivElement;
        templateNode.innerHTML = template.trim();
        let checkmarkNode = getElem('.checkmark', templateNode) as HTMLElement;
        let labelNode = getElem('label', templateNode) as HTMLLabelElement;
        let cloneEle = ele.cloneNode(true) as HTMLInputElement;
        if (randomID) {
            cloneEle.id = randomID;
        }
        if (remainLabel === true) {
            labelNode.htmlFor = cloneEle.id;
        }
        checkmarkNode.addEventListener('click', (e: Event) => {
            e.preventDefault();
            cloneEle.click();
        });
        if (checkmarkNode.parentNode) {
            checkmarkNode.parentNode.insertBefore(cloneEle, checkmarkNode);
        }

        return {cloneEle, templateNode, labelNode};
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

    static restoreElement(element: EnhancedElement): void {
        if (typeof element.checkBoxChange === 'function') {
            element.removeEventListener('change', element.checkBoxChange);
        }
        element.checkBoxChange = undefined;
        element.removeAttribute('data-checkbox');
        if (element.parentNode && element instanceof ChildNode) {
            let parentElement = element.parentNode;
            parentElement.replaceChild(element, element);
        }
        
        let labelNode = element.isValidLabel;
        if (labelNode && labelNode.nodeType === Node.ELEMENT_NODE) {
            element.parentNode?.insertBefore(labelNode, element.nextSibling);
        }
    }
}

Utils.setStylesheetId('checkbox-style');
Utils.setReplaceRule('.check-box', '.check-box-');

export default Utils;

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
    removeStylesheet
} from '@carry0987/utils';
import { TotalCheckbox, CheckboxTitleDetails, CheckboxTemplate, EnhancedElement } from '@/interface/interfaces';
import { CheckAllButtons } from '@/type/types';

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
    static addEventListener = eventUtils.addEventListener;
    static dispatchEvent = eventUtils.dispatchEvent;

    static getTemplate(id: string | number): string {
        id = id.toString();
        let template = `
        <div class="checkbox check-box-${id}">
            <span class="checkmark"></span>
            <label class="checkbox-label"></label>
        </div>
        `;

        return template;
    }

    static getCheckAllElements(ele: CheckAllButtons): HTMLInputElement[] {
        if (!ele) return [];
        let checkAllElements: HTMLInputElement[] = [];
        if (Array.isArray(ele)) {
            ele.forEach((elem) => {
                if (typeof elem === 'string') {
                    checkAllElements.push(...Utils.getElem<HTMLInputElement>(elem, 'all'));
                } else if (elem instanceof HTMLInputElement) {
                    checkAllElements.push(elem);
                }
            });
        } else if (typeof ele === 'string') {
            checkAllElements.push(...Utils.getElem<HTMLInputElement>(ele, 'all'));
        } else if (ele instanceof HTMLInputElement) {
            checkAllElements.push(ele);
        }

        return checkAllElements.filter((elem) => elem !== null);
    }

    static handleCheckboxTitle(ele: HTMLElement, labelSibling: HTMLElement | null): CheckboxTitleDetails {
        let title: string | null = ele.title || ele.dataset.checkboxTitle || null;
        let remainLabel: boolean = false;
        let randomID: string | null = null;
        let isValidLabel: boolean = false;
        let labelToRestore: HTMLLabelElement | undefined;

        if (labelSibling instanceof HTMLLabelElement) {
            const htmlFor = labelSibling.htmlFor;
            const dataCheckboxFor = labelSibling.dataset.checkboxFor;
            const dataCheckboxId = ele.dataset.checkboxId;
            remainLabel = !Utils.isEmpty(ele.id) && htmlFor === ele.id;
            isValidLabel = !Utils.isEmpty(ele.id) && dataCheckboxFor === ele.id;
            if (!Utils.isEmpty(dataCheckboxId) && dataCheckboxFor === dataCheckboxId) {
                randomID = Utils.isEmpty(ele.id) && Utils.isEmpty(htmlFor) ? 'check-' + Utils.generateRandom(6) : null;
                isValidLabel = true;
            }
            if (isValidLabel || remainLabel) {
                labelToRestore = labelSibling.cloneNode(true) as HTMLLabelElement;
                // Prefer the explicitly set title, fall back to text from the label.
                title = title || labelSibling.textContent;
                // Remove the original label
                labelSibling.parentNode!.removeChild(labelSibling);
            }
        }

        return { title, remainLabel, randomID, labelToRestore };
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
        let cloneEle = ele.cloneNode(true) as EnhancedElement;
        cloneEle.withID = true;
        if (randomID) {
            cloneEle.id = randomID;
            cloneEle.withID = false;
        }
        if (remainLabel === true) {
            labelNode.htmlFor = cloneEle.id;
        }
        checkmarkNode.addEventListener('click', (e: MouseEvent) => {
            e.preventDefault();
            cloneEle.click();
            // Dispatch a custom event when the shift key is pressed
            if (e.shiftKey) {
                this.triggerShiftClick(cloneEle);
            }
        });
        if (checkmarkNode.parentNode) {
            checkmarkNode.parentNode.insertBefore(cloneEle, checkmarkNode);
        }
        // Replace the original element with the new one
        ele.parentNode!.replaceChild(templateNode.firstElementChild || templateNode, ele);

        return { cloneEle, templateNode, labelNode };
    }

    static insertCheckboxTitle(
        title: string | null,
        bindLabel: boolean,
        labelNode: HTMLLabelElement,
        cloneEle: EnhancedElement
    ): void {
        if (!title) {
            labelNode.parentNode!.removeChild(labelNode);
        } else {
            labelNode.textContent = title;
            if (bindLabel === true) {
                labelNode.classList.add('checkbox-labeled');
                labelNode.addEventListener('click', (e: MouseEvent) => {
                    e.preventDefault();
                    cloneEle.click();
                    // Dispatch a custom event when the shift key is pressed
                    if (e.shiftKey) {
                        this.triggerShiftClick(cloneEle);
                    }
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

    static toggleDisableStatus(ele: EnhancedElement, disabled: boolean): void {
        if (disabled) {
            ele.disabled = true;
            ele.setAttribute('disabled', 'disabled');
        } else {
            ele.disabled = false;
            ele.removeAttribute('disabled');
        }
    }

    static toggleCheckAll(eles: EnhancedElement[], total?: TotalCheckbox): void {
        if (eles.length === 0) return;
        eles.forEach((ele) => {
            if (!total || !total.checked || !total.input) {
                Utils.toggleCheckStatus(ele, false);
                return;
            }
            const allChecked = total.checked.length === total.input.length && total.checked.length !== 0;
            Utils.toggleCheckStatus(ele, allChecked);
        });
    }

    static restoreElement(element: EnhancedElement): void {
        if (typeof element.checkBoxChange === 'function') {
            element.removeEventListener('change', element.checkBoxChange);
        }
        if (typeof element.checkAllChange === 'function') {
            element.removeEventListener('change', element.checkAllChange);
        }
        if (element.withID === false) {
            element.removeAttribute('id');
        }
        element.checkBoxChange = undefined;
        element.removeAttribute('data-checkbox');
        if (element.parentNode) {
            let parentElement = element.parentNode as HTMLElement;
            parentElement.replaceWith(element);
        }
        let labelNode = element.labelToRestore;
        if (labelNode && labelNode.nodeType === Node.ELEMENT_NODE) {
            element.parentNode?.insertBefore(labelNode, element.nextSibling);
        }
    }

    private static triggerShiftClick(cloneEle: EnhancedElement): void {
        let event = Utils.createEvent('shift-click', { checkedElement: cloneEle });
        Utils.dispatchEvent(event, cloneEle);
    }
}

Utils.setStylesheetId('checkbox-style');
Utils.setReplaceRule('.check-box', '.check-box-');

export default Utils;

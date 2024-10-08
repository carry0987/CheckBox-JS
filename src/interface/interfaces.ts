import { CheckedTargets, CheckAllButtons } from '@/type/types';

export interface OnChangeCallback {
    (total: TotalCheckbox, target?: EnhancedElement): void;
}

export interface OnCheckAllCallback {
    (checkedAll: boolean): void;
}

export interface CheckBoxOption {
    checked: CheckedTargets;
    checkMark: string;
    checkAll: CheckAllButtons;
    allowShiftKey: boolean;
    bindLabel: boolean;
    styles: object;
    onChange: OnChangeCallback;
    onCheckAll: OnCheckAllCallback;
}

export interface TotalCheckbox {
    input: EnhancedElement[]; // Store all checkbox element
    checked: EnhancedElement[]; // Store all checked checkbox
    list: string[]; // Store all checked checkbox value
}

export interface CheckboxTitleDetails {
    title: string | null;
    remainLabel: boolean;
    randomID: string | null;
    labelToRestore?: HTMLLabelElement;
}

export interface CheckboxTemplate {
    cloneEle: EnhancedElement;
    templateNode: HTMLDivElement;
    labelNode: HTMLLabelElement;
}

export interface EnhancedElement extends HTMLInputElement {
    withID: boolean;
    checkAllChange?: EventListener;
    checkBoxChange?: EventListener;
    labelToRestore?: HTMLLabelElement;
}

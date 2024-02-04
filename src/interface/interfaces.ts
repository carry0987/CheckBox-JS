export interface OnChangeCallback {
    (total: TotalCheckbox, target: HTMLInputElement | null): void;
}

export interface OnCheckAllCallback {
    (checkedAll: boolean): void;
}

export interface CheckBoxOption {
    checked?: boolean | string | number | Array<string | number>;
    checkMark?: string;
    checkAll?: string;
    onChange?: OnChangeCallback;
    onCheckAll?: OnCheckAllCallback;
    bindLabel?: boolean;
    styles?: object;
}

export interface TotalCheckbox {
    input: HTMLInputElement[]; // Store all checkbox element
    checked: HTMLInputElement[]; // Store all checked checkbox
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
    checkAllChange?: EventListener;
    checkBoxChange?: EventListener;
    labelToRestore?: HTMLLabelElement;
}

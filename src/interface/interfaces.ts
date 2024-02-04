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
    checked: HTMLInputElement[];
    list: string[];
    input: HTMLInputElement[];
}

export interface CheckboxTitleDetails {
    title: string | null;
    remainLabel: boolean;
    randomID: string | null;
    isValidLabel: boolean;
}

export interface CheckboxTemplate {
    cloneEle: HTMLInputElement;
    templateNode: HTMLDivElement;
    labelNode: HTMLLabelElement;
}

export interface EnhancedElement extends HTMLElement {
    checkBoxChange?: EventListener;
    isValidLabel?: HTMLElement;
}

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

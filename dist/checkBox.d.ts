interface OnChangeCallback {
    (total: TotalCheckbox, target: HTMLInputElement | null): void;
}
interface OnCheckAllCallback {
    (checkedAll: boolean): void;
}
interface CheckBoxOption {
    checked?: boolean | string | number | Array<string | number>;
    checkMark?: string;
    checkAll?: string;
    onChange?: OnChangeCallback;
    onCheckAll?: OnCheckAllCallback;
    bindLabel?: boolean;
    styles?: object;
}
interface TotalCheckbox {
    input: HTMLInputElement[];
    checked: HTMLInputElement[];
    list: string[];
}

declare class CheckBox {
    private static instances;
    private static version;
    private static firstLoad;
    private element;
    private options;
    private id;
    private allElement;
    private total;
    private checkAllElement?;
    private onChangeCallback?;
    private onCheckAllCallback?;
    constructor(element: string | HTMLInputElement, option?: CheckBoxOption);
    private init;
    private injectStyles;
    private setupCallbacks;
    private processCheckbox;
    private updateCheckboxCheckedStatus;
    private setupCheckAll;
    private checkBoxChange;
    private updateTotal;
    private updateCheckAllStatus;
    private dispatchCheckboxChangeEvent;
    private destroy;
    set onChange(callback: OnChangeCallback);
    set onCheckAll(callback: OnCheckAllCallback);
    getCheckBox(): TotalCheckbox;
    refresh(): void;
    static destroyAll(): void;
}

export { CheckBox as default };

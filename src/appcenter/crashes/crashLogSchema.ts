export interface BaseLogSchema {
    type: string;
    toffset: number;
    sid: string;
    device: DeviceSchema;
    timestamp: string;
}

export interface CrashLogSchema extends BaseLogSchema {
    id: string;
    processId: number;
    processName: string;
    parentProcessId: number;
    parentProcessName: string;
    errorThreadId: number;
    errorThreadName: string;
    fatal: boolean;
    appLaunchToffset: number;
    errorAttachment: any;
    architecture: string;
    primaryArchitectureId: number;
    architectureVariantId: number;
    applicationPath: string;
    osExceptionType: string;
    osExceptionCode: string;
    osExceptionAddress: string;
    exceptionType: string;
    exceptionReason: string;
    exception: any;
    threads: any;
    binaries: any;
    registers: any;
    crashTimestamp: string;
    ingestTimestamp: string;
    appStartTimestamp: string;
    appId: string;
    installId: string;
    appLaunchTimestamp: string;
}

export interface DeviceSchema {
    sdkName: string;
    sdkVersion: string;
    wrapperSdkVersion: string;
    wrapperSdkName: string;
    model: string;
    oemName: string;
    osName: string;
    osVersion: string;
    osBuild: string;
    osApiLevel: number;
    locale: string;
    timeZoneOffset: number;
    screenSize: string;
    appVersion: string;
    carrierName: string;
    carrierCountry: string;
    appBuild: string;
    appNamespace: string;
    liveUpdateReleaseLabel: string;
    liveUpdateDeploymentKey: string;
    liveUpdatePackageHash: string;
}

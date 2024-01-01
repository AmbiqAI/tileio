
export const ECG_SAMPLE_RATE = 100;
export const ECG_SAMPLE_PERIOD_MS = 1000 / ECG_SAMPLE_RATE;
export const BLE_SAMPLES_PER_PACKET = 20;

export const SIG_MASK_SEG_OFFSET = 0
export const SIG_MASK_FID_OFFSET = 2
export const SIG_MASK_QOS_OFFSET = 4
export const SIG_MASK_BEAT_OFFSET = 6
export const SIG_MASK_SEG_MASK = 0x3
export const SIG_MASK_FID_MASK = 0x3
export const SIG_MASK_QOS_MASK = 0x3
export const SIG_MASK_BEAT_MASK = 0x3

// ECG Segmentation Classes
export const ECG_SEG_NONE = 0
export const ECG_SEG_PWAVE = 1
export const ECG_SEG_QRS = 1
export const ECG_SEG_TWAVE = 3

// ECG Fiducial Classes
export const ECG_FID_NONE = 0
export const ECG_FID_PPEAK = 1
export const ECG_FID_QRS = 1
export const ECG_FID_TPEAK = 3

// ECG QoS Classes
export const SIG_QOS_BAD = 0
export const SIG_QOS_POOR = 1
export const SIG_QOS_FAIR = 2
export const SIG_QOS_GOOD = 3

// ECG Beat Classes
export const ECG_BEAT_NONE = 0
export const ECG_BEAT_NSR = 1
export const ECG_BEAT_PNC = 2
export const ECG_BEAT_NOISE = 3

// PPG Beat Classes
export const PPG_BEAT_NONE = 0
export const PPG_BEAT_NSR = 1
export const PPG_BEAT_PNC = 2
export const PPG_BEAT_NOISE = 3

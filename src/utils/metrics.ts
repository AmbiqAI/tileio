
export function extractFiducials(data: number[], mask: number) {
    const fiducials = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i] === mask) {
        fiducials.push(i);
        }
    }
    return fiducials;
}

export function extractRPeaks(data: number[]) {
    extractFiducials(data, 1);
}

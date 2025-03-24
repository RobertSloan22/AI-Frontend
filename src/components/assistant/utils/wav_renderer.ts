export class WavRenderer {
  static drawBars(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    values: Float32Array,
    color: string,
    barWidth: number,
    barSpacing: number,
    minHeight: number
  ) {
    if (!values || values.length === 0) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const barCount = Math.floor(width / (barWidth + barSpacing));
    const normalizedValues = this.normalizeArray(values, barCount);

    ctx.fillStyle = color;

    for (let i = 0; i < barCount; i++) {
      const value = normalizedValues[i];
      const barHeight = Math.max(value * height, minHeight);
      const x = i * (barWidth + barSpacing);
      const y = (height - barHeight) / 2;

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  private static normalizeArray(array: Float32Array, length: number): Float32Array {
    if (!array || length <= 0 || array.length === 0) {
      return new Float32Array(length).fill(0);
    }

    try {
      const result = new Float32Array(length);
      const scale = array.length / length;

      for (let i = 0; i < length; i++) {
        const pos = Math.floor(i * scale);
        result[i] = array[pos];
      }

      // Normalize values between 0 and 1
      const maxValue = Math.max(...result);
      if (maxValue > 0) {
        for (let i = 0; i < length; i++) {
          result[i] = result[i] / maxValue;
        }
      }

      return result;
    } catch (error) {
      console.error('Error normalizing array:', error);
      return new Float32Array(length).fill(0);
    }
  }
}

/**
 * 轻量单文件选择：原生 input[type=file] + 拖放，仅选择与预览，无上传逻辑。
 * 用于 FileSelection 等只需「选文件 + 取 File 对象」的场景。
 */
import type { ComputedRef, Ref } from 'vue';
import { ref, computed, onUnmounted } from 'vue';

export function useFilePicker(): {
  file: Ref<File | null>;
  fileCount: ComputedRef<number>;
  setFile: (f: File | null) => void;
  inputRef: Ref<HTMLInputElement | null>;
  onInputChange: (e: Event) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
} {
  const file = ref<File | null>(null);
  const fileCount = computed(() => (file.value ? 1 : 0));
  const inputRef = ref<HTMLInputElement | null>(null);

  function setFile(f: File | null) {
    file.value = f;
    const input = inputRef.value;
    if (input) input.value = '';
  }

  function takeFirstFile(files: FileList | null): File | null {
    if (!files?.length) return null;
    const first = files[0];
    return first ?? null;
  }

  function onInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const chosen = takeFirstFile(target.files);
    file.value = chosen;
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const items = e.dataTransfer?.items;
    const files = e.dataTransfer?.files;
    if (items?.length) {
      const first = items[0];
      if (first?.kind === 'file') {
        const f = first.getAsFile();
        file.value = f ?? null;
      }
    } else if (files?.length) {
      file.value = files[0] ?? null;
    }
  }

  onUnmounted(() => {
    file.value = null;
  });

  return {
    file,
    fileCount,
    setFile,
    inputRef,
    onInputChange,
    onDragOver,
    onDrop,
  };
}

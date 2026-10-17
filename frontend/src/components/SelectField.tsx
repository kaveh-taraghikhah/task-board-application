'use client';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

type Option<T extends string> = {
  value: T;
  label: string;
};

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  const current = options.find((option) => option.value === value);

  return (
    <label className="block space-y-1 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <ListboxButton className="flex w-full items-center justify-between rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-right">
            <span>{current?.label}</span>
            <span aria-hidden>▾</span>
          </ListboxButton>
          <ListboxOptions className="absolute z-20 mt-1 w-full rounded-lg border border-[var(--line)] bg-white shadow-lg">
            {options.map((option) => (
              <ListboxOption
                key={option.value}
                value={option.value}
                className="cursor-pointer px-3 py-2 data-[focus]:bg-[var(--bg)]"
              >
                {option.label}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </label>
  );
}

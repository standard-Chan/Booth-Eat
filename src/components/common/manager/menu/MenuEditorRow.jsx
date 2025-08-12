// src/components/manager/menu/MenuEditorRow.jsx
import React, { useMemo, useRef } from "react";
import styled from "styled-components";

const Row = styled.div`
  background: #fff;
  border: 1px dashed #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const Select = styled.select`
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 1px;
  font-size: 14px;
  background: #fff;
  &:focus {
    outline: none;
    border-color: #d1d5db;
  }
`;

const ImageBox = styled.label`
  width: 56px;
  height: 56px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  display: grid;
  place-items: center;
  cursor: pointer;
  overflow: hidden;
  background: #fafafa;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Inputs = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Row1 = styled.div`
  display: grid;
  grid-template-columns: 1fr 140px 52px;
  gap: 10px;
  align-items: center;
`;

const Text = styled.input`
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #d1d5db;
  }
`;

const Area = styled.textarea`
  min-height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #d1d5db;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Btn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;
const Primary = styled(Btn)`
  border-color: #ff6a2b;
  background: #ff6a2b;
  color: #fff;
  font-weight: 600;
  &:hover {
    filter: brightness(0.98);
  }
`;

export default function MenuEditorRow({
  mode, // 'create' | 'edit'
  draft, // {name, price, description, previewImage(File|string|null), available}
  setDraft,
  onCancel,
  onSubmit,
}) {
  const fileRef = useRef(null);

  const previewSrc = useMemo(() => {
    if (!draft.previewImage) return null;
    if (typeof draft.previewImage === "string") return draft.previewImage;
    if (draft.previewImage instanceof File)
      return URL.createObjectURL(draft.previewImage);
    return null;
  }, [draft.previewImage]);

  const set = (k, v) => setDraft((prev) => ({ ...prev, [k]: v }));

  return (
    <Row>
      <ImageBox>
        {previewSrc ? (
          <img src={previewSrc} alt="preview" />
        ) : (
          <span>이미지</span>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => set("previewImage", e.target.files?.[0] ?? null)}
        />
      </ImageBox>

      <Inputs>
        <Row1>
          <Text
            placeholder="음식명을 입력해주세요"
            value={draft.name || ""}
            onChange={(e) => set("name", e.target.value)}
          />
          <Text
            placeholder="가격"
            value={draft.price ?? ""}
            onChange={(e) =>
              set("price", e.target.value.replace(/\D/g, "").slice(0, 9))
            }
          />
          <Select
            value={draft.category ?? "FOOD"}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="FOOD">음식</option>
            <option value="DRINK">음료</option>
          </Select>
        </Row1>

        <Area
          placeholder="설명을 입력해주세요"
          value={draft.description || ""}
          onChange={(e) => set("description", e.target.value)}
        />

        <Actions>
          <Primary onClick={onSubmit}>
            {mode === "create" ? "추가" : "수정 저장"}
          </Primary>
          <Btn onClick={onCancel}>취소</Btn>
        </Actions>
      </Inputs>
    </Row>
  );
}

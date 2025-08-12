// src/pages/manager/MenuManagePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import AppLayout from "../../components/common/manager/AppLayout.jsx";
import { useParams } from "react-router-dom";

import MenuCard from "../../components/common/manager/menu/MenuCard.jsx";
import MenuEditorRow from "../../components/common/manager/menu/MenuEditorRow.jsx";
import {
  addMenu,
  updateMenu,
  deleteMenu,
  toggleMenuAvailable,
} from "../../api/manager/menuApi.js";
import { toURL, API_PUBLIC } from "../../api/api.js";

/** 공통 fetch 핸들러 */
async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (!res.ok) {
    let detail;
    try {
      detail = isJson ? await res.json() : await res.text();
    } catch {
      detail = null;
    }
    const message =
      (detail && (detail.message || detail.error || JSON.stringify(detail))) ||
      `HTTP ${res.status} ${res.statusText}`;
    const err = new Error(message);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  if (res.status === 204) return null;
  return isJson ? res.json() : res.text();
}

/** 부스 메뉴 목록 조회 */
async function fetchMenus(boothId) {
  const url = toURL(API_PUBLIC.LIST_MENUS_BY_BOOTH(boothId));
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return handleResponse(res);
}

export default function MenuManagePage() {
  const { boothId } = useParams(); // ex) /manager/:boothId/menus
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 인라인 추가/수정 상태
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState({
    boothId: boothId,
    name: "",
    price: "",
    description: "",
    previewImage: null,
    available: true,
    category: "FOOD", // 추가: 기본값
  });

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const reload = async () => {
    setLoading(true);
    try {
      const list = await fetchMenus(boothId);
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      alert(e.message || "목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!boothId) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boothId]);

  // 판매 상태 토글 (낙관적 업데이트 + 서버 반영)
  const handleToggleAvailable = async (item, next) => {
    const id = item.menuItemId;
    const backup = items;
    setItems((prev) =>
      prev.map((it) => (it.menuItemId === id ? { ...it, available: next } : it))
    );
    try {
      await toggleMenuAvailable(id, next);
    } catch (e) {
      alert(e.message || "상태 변경에 실패했어요.");
      setItems(backup); // 롤백
    }
  };

  // 삭제
  const handleDelete = async (item) => {
    if (!window.confirm(`'${item.name}'을 삭제하시겠습니까?`)) return;
    const backup = items;
    setItems((prev) => prev.filter((it) => it.menuItemId !== item.menuItemId));
    try {
      await deleteMenu(boothId, item.menuItemId);
    } catch (e) {
      alert(e.message || "삭제에 실패했어요.");
      setItems(backup);
    }
  };

  // 수정 시작
  const handleEdit = (item) => {
    setEditingId(item.menuItemId);
    setEditDraft({
      boothId: boothId,
      name: item.name ?? "",
      price: item.price ?? "",
      description: item.description ?? "",
      previewImage: item.previewImage ?? null,
      available: item.available ?? true,
      category: item.category ?? "FOOD", // 추가: 기본값
    });
  };

  // 수정 저장
  const submitEdit = async () => {
    const id = editingId;
    if (!id) return;

    const payload = {
      boothId: boothId,
      name: editDraft.name?.trim(),
      price: Number(editDraft.price),
      description: editDraft.description?.trim(),
      previewImage: editDraft.previewImage ?? null,
      available: editDraft.available,
      category: editDraft.category ?? "FOOD", // 추가: 전달
    };

    try {
      await updateMenu(boothId, id, payload);
      setEditingId(null);
      setEditDraft({});
      await reload();
    } catch (e) {
      alert(e.message || "수정에 실패했어요.");
    }
  };

  // 추가
  const submitCreate = async () => {
    if (!createDraft.name?.trim()) return alert("메뉴명을 입력해줘");
    if (!createDraft.price) return alert("가격을 입력해줘");

    try {
      await addMenu(boothId, {
        boothId: boothId,
        name: createDraft.name.trim(),
        price: Number(createDraft.price),
        description: createDraft.description?.trim(),
        available: true,
        previewImage: createDraft.previewImage ?? null,
        category: createDraft.category ?? "FOOD", // 추가: 전달
      });
      setCreating(false);
      setCreateDraft({
        boothId: boothId,
        name: "",
        price: "",
        description: "",
        previewImage: null,
        available: true,
        category: "FOOD",
      });
      await reload();
    } catch (e) {
      alert(e.message || "추가에 실패했어요.");
    }
  };

  const selling = useMemo(() => items.filter((i) => i.available), [items]);
  const stopped = useMemo(() => items.filter((i) => !i.available), [items]);

  return (
    <AppLayout title="메뉴 관리">
      <HeaderLine>
        <AddBtn onClick={() => setCreating((v) => !v)}>+ 메뉴 추가</AddBtn>
      </HeaderLine>

      <Stack>
        {/* 추가 줄은 맨 위에 */}
        {creating && (
          <MenuEditorRow
            mode="create"
            draft={createDraft}
            setDraft={setCreateDraft}
            onCancel={() => {
              setCreating(false);
              setCreateDraft({
                boothId: boothId,
                name: "",
                price: "",
                description: "",
                previewImage: null,
                available: true,
                category: "FOOD",
              });
            }}
            onSubmit={submitCreate}
          />
        )}

        <SectionTitle on>판매 중</SectionTitle>
        {loading && items.length === 0 ? (
          <div>로딩중…</div>
        ) : (
          selling.map((it) =>
            editingId === it.menuItemId ? (
              <MenuEditorRow
                key={it.menuItemId}
                mode="edit"
                draft={editDraft}
                setDraft={setEditDraft}
                onCancel={() => {
                  setEditingId(null);
                  setEditDraft({});
                }}
                onSubmit={submitEdit}
              />
            ) : (
              <MenuCard
                key={it.menuItemId}
                item={it}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleLocal={(id, available) =>
                  handleToggleAvailable(it, available)
                }
              />
            )
          )
        )}

        <SectionTitle>판매 중지</SectionTitle>
        {stopped.map((it) =>
          editingId === it.menuItemId ? (
            <MenuEditorRow
              key={it.menuItemId}
              mode="edit"
              draft={editDraft}
              setDraft={setEditDraft}
              onCancel={() => {
                setEditingId(null);
                setEditDraft({});
              }}
              onSubmit={submitEdit}
            />
          ) : (
            <MenuCard
              key={it.menuItemId}
              item={it}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleLocal={(id, available) =>
                handleToggleAvailable(it, available)
              }
            />
          )
        )}
      </Stack>
    </AppLayout>
  );
}

const HeaderLine = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ff6a2b;
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    filter: brightness(0.98);
  }
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.div`
  margin: 14px 0 6px;
  color: #6b7280;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ on }) => (on ? "#ff6a2b" : "#9aa0a6")};
  }
`;

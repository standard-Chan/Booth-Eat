// src/pages/manager/MenuManagePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import AppLayout from '../../components/common/manager/AppLayout.jsx';

import { useParams } from 'react-router-dom';
import { fetchMenus, createMenu, updateMenu, deleteMenu } from '../../api/manager/menuApi.js';
import MenuCard from '../../components/common/manager/menu/MenuCard.jsx';
import MenuEditorRow from '../../components/common/manager/menu/MenuEditorRow.jsx';

export default function MenuManagePage() {
  const { boothId } = useParams(); // 라우터에서 추출 (ex: /manager/:boothId/menus)
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 인라인 추가/수정 상태
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState({ name:'', price:'', description:'', previewImage:null, available:true });

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const reload = async () => {
    setLoading(true);
    try {
      const list = await fetchMenus(boothId);
      setItems(list);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, [boothId]);

  // 판매 상태 토글(낙관적)
  const onToggleLocal = (id, available) => {
    setItems(prev => prev.map(it => it.menuItemId === id ? { ...it, available } : it));
  };

  // 삭제
  const handleDelete = async (item) => {
    if (!window.confirm(`'${item.name}'을 삭제하시겠습니까?`)) return;
    const backup = items;
    setItems(prev => prev.filter(it => it.menuItemId !== item.menuItemId));
    try {
      await deleteMenu(item.menuItemId);
    } catch (e) {
      alert(e.message);
      setItems(backup);
    }
  };

  // 수정 시작
  const handleEdit = (item) => {
    setEditingId(item.menuItemId);
    setEditDraft({
      name: item.name ?? '',
      price: item.price ?? '',
      description: item.description ?? '',
      previewImage: item.previewImage ?? null,
      available: item.available ?? true,
    });
  };

  const submitEdit = async () => {
    const id = editingId;
    if (!id) return;
    const payload = {
      name: editDraft.name?.trim(),
      price: Number(editDraft.price),
      description: editDraft.description?.trim(),
      previewImage: editDraft.previewImage,
    };
    try {
      await updateMenu(id, payload);
      setEditingId(null);
      setEditDraft({});
      await reload();
    } catch (e) {
      alert(e.message);
    }
  };

  // 추가
  const submitCreate = async () => {
    if (!createDraft.name?.trim()) return alert('메뉴명을 입력해줘');
    if (!createDraft.price) return alert('가격을 입력해줘');

    try {
      await createMenu(boothId, {
        name: createDraft.name.trim(),
        price: Number(createDraft.price),
        description: createDraft.description?.trim(),
        available: true,
        previewImage: createDraft.previewImage ?? null,
      });
      setCreating(false);
      setCreateDraft({ name:'', price:'', description:'', previewImage:null, available:true });
      await reload();
    } catch (e) {
      alert(e.message);
    }
  };

  const selling = useMemo(() => items.filter(i => i.available), [items]);
  const stopped = useMemo(() => items.filter(i => !i.available), [items]);

  return (
    <AppLayout title="메뉴 관리">
      <HeaderLine>
        <AddBtn onClick={() => setCreating(v => !v)}>
          + 메뉴 추가
        </AddBtn>
      </HeaderLine>

      <Stack>
        {/* 추가 줄은 맨 위에 */}
        {creating && (
          <MenuEditorRow
            mode="create"
            draft={createDraft}
            setDraft={setCreateDraft}
            onCancel={() => { setCreating(false); setCreateDraft({ name:'', price:'', description:'', previewImage:null, available:true }); }}
            onSubmit={submitCreate}
          />
        )}

        <SectionTitle on>판매 중</SectionTitle>
        {loading && items.length === 0 ? (
          <div>로딩중…</div>
        ) : (
          selling.map(it => (
            editingId === it.menuItemId ? (
              <MenuEditorRow
                key={it.menuItemId}
                mode="edit"
                draft={editDraft}
                setDraft={setEditDraft}
                onCancel={() => { setEditingId(null); setEditDraft({}); }}
                onSubmit={submitEdit}
              />
            ) : (
              <MenuCard
                key={it.menuItemId}
                item={it}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleLocal={onToggleLocal}
              />
            )
          ))
        )}

        <SectionTitle>판매 중지</SectionTitle>
        {stopped.map(it => (
          editingId === it.menuItemId ? (
            <MenuEditorRow
              key={it.menuItemId}
              mode="edit"
              draft={editDraft}
              setDraft={setEditDraft}
              onCancel={() => { setEditingId(null); setEditDraft({}); }}
              onSubmit={submitEdit}
            />
          ) : (
            <MenuCard
              key={it.menuItemId}
              item={it}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleLocal={onToggleLocal}
            />
          )
        ))}
      </Stack>
    </AppLayout>
  );
}



const HeaderLine = styled.div`
  display:flex; justify-content:flex-end; margin-bottom:14px;
`;

const AddBtn = styled.button`
  display:flex; align-items:center; gap:8px;
  background:#ff6a2b; color:#fff; border:0; border-radius:10px;
  padding:10px 14px; cursor:pointer; font-weight:600;
  &:hover{ filter:brightness(0.98); }
`;

const Stack = styled.div`
  display:flex; flex-direction:column; gap:12px;
`;

const SectionTitle = styled.div`
  margin: 14px 0 6px; color:#6b7280; font-size:14px; display:flex; align-items:center; gap:8px;
  &::before{
    content:'';
    display:inline-block; width:8px; height:8px; border-radius:50%;
    background:${({on}) => (on ? '#ff6a2b' : '#9aa0a6')};
  }
`;

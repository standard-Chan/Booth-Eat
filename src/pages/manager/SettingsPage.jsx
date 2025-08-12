// src/pages/manager/ManagerSettingsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/common/manager/AppLayout.jsx";
import { getManager, createManager } from "../../api/manager/managerInfoApi.js";



// 필수 필드 목록
const REQUIRED_FIELDS = ["username", "accountBank", "accountNo", "accountHolder"];

// 응답 유효성 검사
function isValidManagerResponse(data) {
  if (!data || typeof data !== "object") return false;
  // 필수 필드가 문자열인지 확인
  for (const key of REQUIRED_FIELDS) {
    if (typeof data[key] !== "string" || data[key].trim() === "") return false;
  }
  // 선택: 숫자 필드가 있으면 타입 체크
  if ("managerId" in data && typeof data.managerId !== "number") return false;
  if ("boothId" in data && typeof data.boothId !== "number") return false;
  return true;
}

// 초기 폼 상태
const emptyForm = {
  username: "",
  accountBank: "",
  accountNo: "",
  accountHolder: "",
};

export default function ManagerSettingsPage() {
  const { boothId: boothIdParam } = useParams();
  const boothId = useMemo(() => Number(boothIdParam), [boothIdParam]);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [invalidResponse, setInvalidResponse] = useState(false); // "잘못된 응답" 여부
  const [hasExisting, setHasExisting] = useState(false); // 유효 데이터 존재 여부

  const [form, setForm] = useState(emptyForm);

  // GET으로 먼저 불러오기
  useEffect(() => {
    if (!boothId || Number.isNaN(boothId)) return;
    setLoading(true);
    setFetchError(null);
    setInvalidResponse(false);
    setHasExisting(false);

    (async () => {
      try {
        const data = await getManager(boothId);
        if (isValidManagerResponse(data)) {
          setForm({
            username: data.username,
            accountBank: data.accountBank,
            accountNo: data.accountNo,
            accountHolder: data.accountHolder,
          });
          setHasExisting(true);
        } else {
          // 잘못된 응답이면 폼 비우고 생성 가능 상태로 둔다
          setForm(emptyForm);
          setInvalidResponse(true);
        }
      } catch (err) {
        // GET 실패 -> 신규 생성 흐름
        setForm(emptyForm);
        setFetchError(err?.message || "GET 호출 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, [boothId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const canSubmit = REQUIRED_FIELDS.every((k) => form[k]?.trim());

  // POST (생성/수정 모두 POST 사용)
  const onSubmit = async () => {
    if (!boothId || Number.isNaN(boothId)) {
      window.alert("boothId가 유효하지 않습니다.");
      return;
    }
    if (!canSubmit) {
      window.alert("모든 필드를 입력해 주세요.");
      return;
    }
    try {
      setLoading(true);
      await createManager(boothId, {
        username: form.username.trim(),
        accountBank: form.accountBank.trim(),
        accountNo: form.accountNo.trim(),
        accountHolder: form.accountHolder.trim(),
      });
      window.alert(hasExisting ? "수정(POST) 완료" : "생성(POST) 완료");

      // 성공 후 다시 GET으로 동기화
      const data = await getManager(boothId);
      if (isValidManagerResponse(data)) {
        setForm({
          username: data.username,
          accountBank: data.accountBank,
          accountNo: data.accountNo,
          accountHolder: data.accountHolder,
        });
        setHasExisting(true);
        setInvalidResponse(false);
        setFetchError(null);
      }
    } catch (err) {
      window.alert(err?.message || "요청 실패");
    } finally {
      setLoading(false);
    }
  };

  const onReload = async () => {
    // 다시 불러오기
    try {
      setLoading(true);
      setFetchError(null);
      setInvalidResponse(false);
      const data = await getManager(boothId);
      if (isValidManagerResponse(data)) {
        setForm({
          username: data.username,
          accountBank: data.accountBank,
          accountNo: data.accountNo,
          accountHolder: data.accountHolder,
        });
        setHasExisting(true);
      } else {
        setForm(emptyForm);
        setInvalidResponse(true);
        setHasExisting(false);
      }
    } catch (err) {
      setForm(emptyForm);
      setHasExisting(false);
      setFetchError(err?.message || "GET 호출 실패");
    } finally {
      setLoading(false);
    }
  };

  const onResetForm = () => setForm(emptyForm);

  return (
    <AppLayout title="부스 매니저 설정">
      <Wrap>
        {/* 상태 뱃지들 */}
        {(loading || fetchError || invalidResponse) && (
          <BannerRow>
            {loading && <Badge>불러오는 중…</Badge>}
            {fetchError && <Badge type="error">GET 실패: {fetchError}</Badge>}
            {invalidResponse && (
              <Badge type="warn">
                잘못된 응답 형식입니다. 값을 입력하고 POST로 생성/수정하세요.
              </Badge>
            )}
            {hasExisting && !invalidResponse && !fetchError && !loading && (
              <Badge type="ok">현재 저장된 설정을 불러왔습니다.</Badge>
            )}
          </BannerRow>
        )}

        <Card>
          <Title>계정 & 계좌 정보</Title>

          <FormRow>
            <Label>운영자명</Label>
            <Input
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="예) 부스 운영자"
            />
          </FormRow>

          <Grid>
            <FormRow>
              <Label>은행명</Label>
              <Input
                name="accountBank"
                value={form.accountBank}
                onChange={onChange}
                placeholder="예) 카카오뱅크"
              />
            </FormRow>
            <FormRow>
              <Label>계좌번호</Label>
              <Input
                name="accountNo"
                value={form.accountNo}
                onChange={onChange}
                placeholder="예) 1234-323432-123"
              />
            </FormRow>
          </Grid>

          <FormRow>
            <Label>예금주</Label>
            <Input
              name="accountHolder"
              value={form.accountHolder}
              onChange={onChange}
              placeholder="예) 홍길동"
            />
          </FormRow>

          <Actions>
            <Button type="secondary" onClick={onReload}>
              다시 불러오기
            </Button>
            <Button type="ghost" onClick={onResetForm}>
              폼 초기화
            </Button>
            <Spacer />
            <Button
              disabled={!canSubmit || loading}
              onClick={onSubmit}
              title={canSubmit ? "" : "필수 값을 모두 입력해 주세요"}
            >
              {hasExisting ? "수정 (POST)" : "생성 (POST)"}
            </Button>
          </Actions>
        </Card>
      </Wrap>
    </AppLayout>
  );
}

/* ---------------- styled-components ---------------- */

const Wrap = styled.div`
  padding: 16px;
  display: grid;
  gap: 14px;
`;

const BannerRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid
    ${({ type }) =>
      type === "error" ? "#ef4444" : type === "warn" ? "#f59e0b" : "#10b981"};
  color: ${({ type }) =>
    type === "error" ? "#ef4444" : type === "warn" ? "#b45309" : "#065f46"};
  background: ${({ type }) =>
    type === "error"
      ? "rgba(239,68,68,0.08)"
      : type === "warn"
      ? "rgba(245,158,11,0.08)"
      : "rgba(16,185,129,0.08)"};
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px;
`;

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const FormRow = styled.div`
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
`;

const Label = styled.label`
  font-size: 13px;
  color: #6b7280;
`;

const Input = styled.input`
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96,165,250,0.15);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 6px;
`;

const Button = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ type }) =>
    type === "ghost" ? "#d1d5db" : "transparent"};
  background: ${({ type }) =>
    type === "secondary" ? "#f3f4f6" : type === "ghost" ? "#fff" : "#111827"};
  color: ${({ type }) => (type === "secondary" || type === "ghost" ? "#111827" : "#fff")};
  cursor: pointer;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

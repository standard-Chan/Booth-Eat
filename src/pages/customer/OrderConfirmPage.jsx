// src/pages/customer/OrderConfirmPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/common/Header.jsx";
import {
  selectCartTotalAmount,
  selectCartItems,
} from "../../store/cartSlice.js";
import { paths } from "../../routes/paths.js";
import { showErrorToast, showSuccessToast } from "../../utils/toast.js";
import { getBoothAccount, createOrder } from "../../api/customerApi.js";
import { addOrderId } from "../../store/orderIdsSlice.js";

export default function OrderConfirmPage() {
  const { boothId, tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const totalAmount = useSelector(selectCartTotalAmount);
  const cartItems = useSelector(selectCartItems);

  const [account, setAccount] = useState(null);
  const [accLoading, setAccLoading] = useState(true);
  const [accError, setAccError] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 복사 배지 UI 상태
  const [copied, setCopied] = useState(false);
  const hideCopiedSoon = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // 계좌정보 API
  useEffect(() => {
    let canceled = false;
    async function fetchAccount() {
      try {
        setAccLoading(true);
        const data = await getBoothAccount(Number(boothId));
        if (!canceled) {
          setAccount(data);
          setAccError(null);
        }
      } catch (e) {
        if (!canceled) {
          setAccount(null);
          setAccError("계좌 정보를 불러오지 못했습니다.");
        }
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        if (!canceled) setAccLoading(false);
      }
    }
    if (boothId) fetchAccount();
    return () => {
      canceled = true;
    };
  }, [boothId]);

  // 입력값 정리
  const cleanPhone = useMemo(() => phone.replace(/[^\d]/g, ""), [phone]);

  // (가능하면 이전 단계에서 설정한 테이블 번호를 세션/스토리지에서 꺼내도록 시도)
  const tableNo = useMemo(() => {
    const s = sessionStorage.getItem("tableNo");
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? n : Number(tableId) || 1;
  }, [tableId]);

  // 계좌 복사 (은행명 + 계좌번호)
  const handleCopyAccount = async () => {
    try {
      if (!account?.bank || !account?.account) return;

      const text = `${account.bank} ${account.account}`;

      // Clipboard API 우선
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      showSuccessToast("계좌번호가 복사되었습니다.");
      hideCopiedSoon();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      showErrorToast("복사에 실패했습니다. 길게 눌러 복사해주세요.");
    }
  };

  const submit = async () => {
    if (!name.trim()) return showErrorToast("성함을 입력해주세요.");
    if (!cleanPhone.trim()) return showErrorToast("전화번호를 입력해주세요.");
    if (!agree) return showErrorToast("개인정보 수집·이용에 동의해주세요.");
    if (!Array.isArray(cartItems) || cartItems.length === 0)
      return showErrorToast("장바구니가 비어 있습니다.");

    try {
      setSubmitting(true);

      // cart → API payload 매핑
      const items = cartItems.map((it) => ({
        foodId: it.foodId,
        name: it.name,
        price: it.price,
        imageUrl: it.imageUrl || "",
        quantity: it.quantity,
      }));

      const payload = {
        boothId: Number(boothId),
        tableNo, // 세션 또는 URL에서 가져온 테이블 번호
        items,
        payment: {
          payerName: name.trim(),
          amount: Number(totalAmount) || 0,
        },
      };

      const res = await createOrder(payload);
      const orderId = res?.orderId;
      if (!orderId) {
        throw new Error("주문번호가 응답에 없습니다.");
      }

      // ✅ 주문 생성 성공 → Redux에 orderId 저장 (테이블별 다중 저장)
      dispatch(
        addOrderId({ tableId: Number(tableId), orderId: Number(orderId) })
      );

      showSuccessToast(`${name}님의 주문요청이 관리자에게 전달되었습니다.`);
      navigate(paths.pending(boothId, tableId, orderId));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      showErrorToast("주문 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <Header
        title="주문상세"
        leftIcon={<span style={{ fontSize: 20 }}>←</span>}
        onLeft={() => navigate(-1)}
        rightIcon={<span />}
      />

      <Body>
        {/* 결제 요약 */}
        <Section>
          <H2>결제</H2>
          <Row>
            <Label>총 금액</Label>
            <Value>{(Number(totalAmount) || 0).toLocaleString()}</Value>
          </Row>
        </Section>

        <Divider />

        {/* 계좌 이체 정보 */}
        <Section>
          <H2>계좌이체</H2>
          <Helper>아래 계좌번호에 주문자님 성함으로 계좌이체 부탁드립니다.</Helper>

          {accLoading ? (
            <Skeleton>계좌 정보를 불러오는 중…</Skeleton>
          ) : accError ? (
            <ErrorText>{accError}</ErrorText>
          ) : (
            <>
              <AccountGrid>
                <Col>
                  <Sub>은행</Sub>
                  <Strong>{account?.bank || "-"}</Strong>
                </Col>

                <Col>
                  <Sub>계좌번호</Sub>
                  <AccountRow>
                    <AccountInline>
                      <Strong aria-label="계좌번호">{account?.account || "-"}</Strong>

                      {/* 계좌번호 바로 옆 복사 버튼 */}
                      <CopyBtn
                        type="button"
                        onClick={handleCopyAccount}
                        disabled={!account?.bank || !account?.account}
                        aria-label="은행명과 계좌번호 복사"
                        title="계좌번호 복사"
                      >
                        📋
                      </CopyBtn>

                      {copied && <CopiedBadge>복사됨</CopiedBadge>}
                    </AccountInline>
                  </AccountRow>
                </Col>

                <Col>
                  <Sub>예금주</Sub>
                  <Strong>{account?.accountHolder || "-"}</Strong>
                </Col>
              </AccountGrid>
            </>
          )}
        </Section>

        <Divider />

        {/* 입력 영역 */}
        <Section>
          <H3>주문자님 정보를 입력해주세요!</H3>

          <InputBox>
            <Input
              placeholder="성함을 입력해주세요."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </InputBox>

          <InputBox>
            <Input
              placeholder="전화 번호를 입력해주세요"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              pattern="[0-9]*"
            />
          </InputBox>

          <Agree type="button" onClick={() => setAgree(!agree)}>
            <Check $on={agree}>{agree ? "✓" : ""}</Check>
            <span>개인정보 수집 이용 동의</span>
          </Agree>
        </Section>
      </Body>

      <Bottom>
        <SubmitBtn onClick={submit} disabled={submitting || accLoading}>
          {submitting ? "전송 중…" : "제출"}
        </SubmitBtn>
      </Bottom>
    </Page>
  );
}

/* ===== styled ===== */
const Page = styled.div`
  max-width: 560px;
  margin: 0 auto;
  padding-bottom: 120px;
`;
const Body = styled.div`
  padding: 8px 16px 0 16px;
`;
const Section = styled.section`
  padding: 12px 0 4px;
`;
const H2 = styled.h2`
  margin: 6px 0 10px;
  font-size: 20px;
  font-weight: 700;
`;
const H3 = styled.h3`
  margin: 10px 0 12px;
  font-size: 18px;
  font-weight: 600;
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 8px;
`;
const Label = styled.div`
  color: #3a2f2a;
  font-weight: 600;
`;
const Value = styled.div`
  font-size: 25px;
  font-weight: 700;
`;
const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eee6df;
  margin: 18px 0;
`;
const Helper = styled.p`
  margin: 0 0 16px;
  color: #7a5f54;
  line-height: 1.5;
`;
const Skeleton = styled.div`
  padding: 16px 8px;
  color: #9a877b;
  font-size: 14px;
`;
const ErrorText = styled.div`
  padding: 16px 8px;
  color: #d04545;
  font-size: 14px;
`;
const AccountGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #efe8e2;
  border-bottom: 1px solid #efe8e2;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;
const Col = styled.div``;
const Sub = styled.div`
  color: #b69f91;
  font-size: 13px;
  margin-bottom: 6px;
`;
const Strong = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #523d33;
`;

/* 계좌번호 감싸는 행 - 전체 행은 block로 두고 내부는 inline-flex로 정렬 */
const AccountRow = styled.div`
  display: block;
`;

/* 계좌번호 + 복사 버튼 + 배지 를 "한 줄"에 자연스럽게 */
const AccountInline = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;             /* 번호와 버튼 사이 살짝 띄움 */
  flex-wrap: wrap;      /* 모바일에서 줄바꿈 허용 */
`;

/* 복사 버튼 - 텍스트 라인과 어울리는 미니 버튼 */
const CopyBtn = styled.button`
  border: none;
  background: transparent;
  background-color: #f8f4de;
  cursor: pointer;
  font-size: 16px;      /* 아이콘 크기 */
  padding: 2px 6px;     /* 작고 가벼운 터치 영역 */
  border-radius: 6px;
  line-height: 1;
  transition: background 0.15s ease;

  &:hover {
    background: #f2f2f2;
  }
  &:active {
    transform: translateY(0.5px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* 복사됨 배지 */
const CopiedBadge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #10b981;
  background: #e6fbf3;
  border: 1px solid #a7f3d0;
  padding: 2px 6px;
  border-radius: 999px;
  line-height: 1;
`;

/* ▼ 입력 영역 */
const InputBox = styled.div`
  margin: 10px 0;
  background: #f4efeb;
  border-radius: 16px;
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  border: 1px solid transparent;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &:has(input:focus) {
    border-color: #e6d9cf;
    box-shadow: 0 0 0 3px rgba(230, 217, 207, 0.35);
  }
`;
const Input = styled.input`
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  color: #523d33;
  &::placeholder {
    color: #bfa79a;
  }
`;
const Agree = styled.button`
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 6px 0;
  font-size: 16px;
`;
const Check = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid #2d2d2d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  background: ${({ $on }) => ($on ? "#fff" : "transparent")};
`;

const Bottom = styled.div`
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  width: min(520px, 92vw);
  padding: 0 8px;
`;
const SubmitBtn = styled.button`
  width: 100%;
  height: 56px;
  background: #ef6a3b;
  color: #fff;
  border: 0;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(239, 106, 59, 0.25);
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

import React, { useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../../components/common/Header.jsx";
import { selectCartTotalAmount } from "../../store/cartSlice.js";
import { paths } from "../../routes/paths.js";
import { showErrorToast, showSuccessToast } from "../../utils/toast.js";

const MOCK_ACCOUNT = {
  bank: "카카오뱅크",
  account: "123-****-****",
  accountHolder: "정석찬",
};

export default function OrderConfirmPage() {
  const { boothId } = useParams();
  const navigate = useNavigate();
  const totalAmount = useSelector(selectCartTotalAmount);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(true);


  // account API로 가져오는 로직 

  const submit = () => {
    if (!name.trim()) return showErrorToast("성함을 입력해주세요.");
    if (!phone.trim()) return showErrorToast("전화번호를 입력해주세요.");
    if (!agree) return showErrorToast("개인정보 수집·이용에 동의해주세요.");
    const dummyOrderId = "ODR12345";
    showSuccessToast(`${name}님의 주문요청이 관리자에게 전달되었습니다.`)
    navigate(paths.pending(boothId, dummyOrderId));
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
        {/* 결제/계좌 영역은 이전 코드 그대로 */}
        <Section>
          <H2>결제</H2>
          <Row>
            <Label>총 금액</Label>
            <Value>{totalAmount.toLocaleString()}</Value>
          </Row>
        </Section>
        <Divider />
        <Section>
          <H2>계좌이체</H2>
          <Helper>
            아래 계좌번호에 주문자님 성함으로 계좌이체 부탁드립니다.
          </Helper>
          <AccountGrid>
            <Col>
              <Sub>은행</Sub>
              <Strong>{MOCK_ACCOUNT.bank}</Strong>
            </Col>
            <Col>
              <Sub>계좌번호</Sub>
              <Strong>{MOCK_ACCOUNT.account}</Strong>
            </Col>
            <Col>
              <Sub>예금주</Sub>
              <Strong>{MOCK_ACCOUNT.accountHolder}</Strong>
            </Col>
          </AccountGrid>
        </Section>
        <Divider />

        {/* 입력 영역 - 스타일 업데이트 */}
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

          <Agree onClick={() => setAgree(!agree)}>
            <Check $on={agree}>{agree ? "✓" : ""}</Check>
            <span>개인정보 수집 이용 동의</span>
          </Agree>
        </Section>
      </Body>

      <Bottom>
        <SubmitBtn onClick={submit}>제출</SubmitBtn>
      </Bottom>
    </Page>
  );
}

/* ===== styled (입력 컴포넌트만 변경) ===== */
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
const AccountGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #efe8e2;
  border-bottom: 1px solid #efe8e2;
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
`;

/* ▼ 여기부터 ‘입력 버튼(=입력 박스)’ 시안 스타일 */
const InputBox = styled.div`
  margin: 10px 0;
  background: #f4efeb; /* 연한 베이지 */
  border-radius: 16px; /* 둥글게 */
  padding: 0 16px; /* 내부 패딩 */
  height: 56px; /* 고정 높이 */
  display: flex;
  align-items: center;
  border: 1px solid transparent; /* 포커스 시 색만 변경 */
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
  } /* 시안처럼 연한 브라운 */
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
`;

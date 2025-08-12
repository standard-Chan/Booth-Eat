import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div>
      <h1>404 Not Found</h1>
      <Link to="/booths/1/menu">홈으로</Link>
    </div>
  );
}

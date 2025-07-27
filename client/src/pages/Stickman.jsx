import StickmanGuitar from '../components/StickmanGuitar';

export default function Stickman() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
      <StickmanGuitar width={200} height={300} />
    </div>
  );
} 
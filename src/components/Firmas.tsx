import Image from 'next/image';

const Firmas = () => {
  const firmas = [
    { name: 'AZUL', alt: 'AZUL - Director - Hey Bristol' },
    { name: 'LARRAIN', alt: 'LARRAIN - Director - Hey Bristol' },
    { name: 'LEMON', alt: 'LEMON - Director - Hey Bristol' },
    { name: 'MARTIN', alt: 'MARTIN - Director - Hey Bristol' },
    { name: 'NAVA', alt: 'NAVA - Director - Hey Bristol' },
    { name: 'SERE', alt: 'SERE - Director - Hey Bristol' }
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
      {firmas.map((firma) => (
        <a 
          key={firma.name}
          href="https://heybristol.com" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Image 
            src={`/images/firmas/${firma.name}.png`}
            alt={firma.alt}
            width={745}
            height={178}
            style={{ 
              display: "block", 
              border: "none",
              maxWidth: "200px",
              height: "auto",
              width: "auto"
            }}
            priority={false}
            loading="lazy"
            sizes="(max-width: 768px) 150px, 200px"
            quality={100}
          />
        </a>
      ))}
    </div>
  );
};
  
export default Firmas;
  
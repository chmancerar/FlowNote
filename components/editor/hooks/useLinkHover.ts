import { useEffect, useState } from 'react';

export interface HoveredLink {
  href: string;
  element: HTMLElement;
  text: string;
  rect: DOMRect;
}

export function useLinkHover() {
  const [hoveredLink, setHoveredLink] = useState<HoveredLink | null>(null);
  const [isEditingLink, setIsEditingLink] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const isInsideEditor = target.closest('.ProseMirror');
      const linkElement = isInsideEditor ? target.closest('a') : null;
      
      const popoverElement = document.getElementById('link-hover-popover');
      if (popoverElement && popoverElement.contains(target)) {
        return;
      }

      if (linkElement) {
        setHoveredLink(prev => {
          if (prev?.element === linkElement) return prev;
          return {
            href: linkElement.getAttribute('href') || '',
            element: linkElement,
            text: linkElement.innerText,
            rect: linkElement.getBoundingClientRect()
          };
        });
      } else {
        setTimeout(() => {
          const currentHover = document.querySelectorAll(':hover');
          let isHoveringPopover = false;
          currentHover.forEach(el => {
            if (el.id === 'link-hover-popover') isHoveringPopover = true;
          });
          if (!isHoveringPopover) {
            setHoveredLink(null);
            setIsEditingLink(false);
          }
        }, 100);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return { hoveredLink, setHoveredLink, isEditingLink, setIsEditingLink };
}

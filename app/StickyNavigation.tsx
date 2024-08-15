import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface StickyNavigationProps {
  sectionNames: string[];
  activeIndex: number;
  onNavClick: (index: number) => void;
}

const NavContainer = styled(motion.nav)`
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 1000;
`;

const NavItemContainer = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  margin: 10px 0;
`;

const NavItem = styled(motion.button)`
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 50%;
  background-color: ${(props) => props.theme.secondary};
  cursor: pointer;
  outline: none;
`;

const NavLabel = styled(motion.span)`
  position: absolute;
  right: 25px;
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
  white-space: nowrap;
`;

const ActiveIndicator = styled(motion.div)`
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme.primary};
  pointer-events: none;
`;

const StickyNavigation: React.FC<StickyNavigationProps> = ({ sectionNames, activeIndex, onNavClick }) => {
  return (
    <NavContainer
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {sectionNames.map((name, index) => (
        <NavItemContainer key={name}>
          <NavItem
            onClick={() => onNavClick(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Navigate to ${name}`}
          />
          <AnimatePresence>
            {index === activeIndex && (
              <ActiveIndicator
                layoutId="activeIndicator"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </AnimatePresence>
          <NavLabel
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {name}
          </NavLabel>
        </NavItemContainer>
      ))}
    </NavContainer>
  );
};

export default StickyNavigation;
import React from 'react'
import { render, screen } from '@testing-library/react'
import Projects from '../page'

jest.mock('@/components/ProjectCard', () => ({
  default: jest.fn(({ project }) => (
    <div data-testid={`project-card-${project.slug}`}>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div data-testid="technologies">
        {project.technologies.join(', ')}
      </div>
      <div data-testid="role">{project.role}</div>
      <a href={project.githubLink} data-testid="github-link">
        GitHub
      </a>
    </div>
  ))
}))

jest.mock('@/components/ui/page-layout', () => ({
  PageLayout: jest.fn(({ children }) => <div data-testid="page-layout">{children}</div>),
  PageHeader: jest.fn(({ title, description }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )),
  Section: jest.fn(({ children }) => <div data-testid="section">{children}</div>)
}))

describe('Projects Page', () => {
  it('should render page header with correct title and description', () => {
    render(<Projects />)
    
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('A collection of projects showcasing my development skills and interests')).toBeInTheDocument()
  })

  it('should render all sample projects', () => {
    render(<Projects />)
    
    expect(screen.getByTestId('project-card-portfolio-website')).toBeInTheDocument()
    expect(screen.getByTestId('project-card-ai-productivity-tool')).toBeInTheDocument()
    expect(screen.getByTestId('project-card-scuba-diving-logbook')).toBeInTheDocument()
  })

  it('should render portfolio website project correctly', () => {
    render(<Projects />)
    
    const portfolioProject = screen.getByTestId('project-card-portfolio-website')
    
    expect(portfolioProject).toContainElement(screen.getByText('Personal Portfolio Website'))
    expect(portfolioProject).toContainElement(
      screen.getByText('A modern, responsive portfolio site built with Next.js and Tailwind CSS.')
    )
    expect(portfolioProject).toContainElement(
      screen.getByText('Next.js, React, Tailwind CSS, Vercel')
    )
    expect(portfolioProject).toContainElement(screen.getByText('Full Stack Developer'))
  })

  it('should render AI productivity tool project correctly', () => {
    render(<Projects />)
    
    const aiProject = screen.getByTestId('project-card-ai-productivity-tool')
    
    expect(aiProject).toContainElement(screen.getByText('AI Productivity Tool'))
    expect(aiProject).toContainElement(
      screen.getByText('A web app that leverages AI to automate daily productivity tasks.')
    )
    expect(aiProject).toContainElement(
      screen.getByText('TypeScript, OpenAI API, Node.js')
    )
    expect(aiProject).toContainElement(screen.getByText('Lead Developer'))
  })

  it('should render scuba diving logbook project correctly', () => {
    render(<Projects />)
    
    const scubaProject = screen.getByTestId('project-card-scuba-diving-logbook')
    
    expect(scubaProject).toContainElement(screen.getByText('Scuba Diving Logbook'))
    expect(scubaProject).toContainElement(
      screen.getByText('A mobile-friendly app for logging and sharing scuba diving experiences.')
    )
    expect(scubaProject).toContainElement(
      screen.getByText('React, Firebase, PWA')
    )
    expect(scubaProject).toContainElement(screen.getByText('Frontend Developer'))
  })

  it('should render GitHub links for all projects', () => {
    render(<Projects />)
    
    const githubLinks = screen.getAllByTestId('github-link')
    expect(githubLinks).toHaveLength(3)
    
    expect(githubLinks[0]).toHaveAttribute('href', 'https://github.com/yourusername/portfolio-website')
    expect(githubLinks[1]).toHaveAttribute('href', 'https://github.com/yourusername/ai-productivity-tool')
    expect(githubLinks[2]).toHaveAttribute('href', 'https://github.com/yourusername/scuba-diving-logbook')
  })

  it('should use correct page layout structure', () => {
    render(<Projects />)
    
    expect(screen.getByTestId('page-layout')).toBeInTheDocument()
    expect(screen.getByTestId('page-header')).toBeInTheDocument()
    expect(screen.getByTestId('section')).toBeInTheDocument()
  })

  it('should have correct grid layout for projects', () => {
    render(<Projects />)
    
    const section = screen.getByTestId('section')
    const gridContainer = section.querySelector('.grid')
    
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer).toHaveClass('grid-cols-1', 'gap-8', 'max-w-4xl', 'mx-auto')
  })

  it('should render projects with unique keys', () => {
    render(<Projects />)
    
    // Each project should have a unique test ID based on its slug
    const projectCards = [
      screen.getByTestId('project-card-portfolio-website'),
      screen.getByTestId('project-card-ai-productivity-tool'),
      screen.getByTestId('project-card-scuba-diving-logbook')
    ]
    
    expect(projectCards).toHaveLength(3)
    projectCards.forEach(card => {
      expect(card).toBeInTheDocument()
    })
  })

  it('should display correct project technologies', () => {
    render(<Projects />)
    
    const portfolioTech = screen.getByTestId('project-card-portfolio-website')
      .querySelector('[data-testid="technologies"]')
    const aiTech = screen.getByTestId('project-card-ai-productivity-tool')
      .querySelector('[data-testid="technologies"]')
    const scubaTech = screen.getByTestId('project-card-scuba-diving-logbook')
      .querySelector('[data-testid="technologies"]')
    
    expect(portfolioTech).toHaveTextContent('Next.js, React, Tailwind CSS, Vercel')
    expect(aiTech).toHaveTextContent('TypeScript, OpenAI API, Node.js')
    expect(scubaTech).toHaveTextContent('React, Firebase, PWA')
  })

  it('should display correct developer roles', () => {
    render(<Projects />)
    
    const portfolioRole = screen.getByTestId('project-card-portfolio-website')
      .querySelector('[data-testid="role"]')
    const aiRole = screen.getByTestId('project-card-ai-productivity-tool')
      .querySelector('[data-testid="role"]')
    const scubaRole = screen.getByTestId('project-card-scuba-diving-logbook')
      .querySelector('[data-testid="role"]')
    
    expect(portfolioRole).toHaveTextContent('Full Stack Developer')
    expect(aiRole).toHaveTextContent('Lead Developer')
    expect(scubaRole).toHaveTextContent('Frontend Developer')
  })
})
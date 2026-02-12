import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MinimalStarsBackground } from '../components/MinimalStarsBackground';

export const TermsOfUse = () => {
    const navigate = useNavigate();
    const { isPortuguese } = useLanguage();

    const lastUpdated = '10 de Fevereiro de 2025';

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark">
            <MinimalStarsBackground />

            {/* Header simples */}
            <header className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-md border-b border-border-dark">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2 lg:py-3 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="font-bold">Zaya Tarot</span>
                    </button>
                </div>
            </header>

            <main className="flex-grow relative z-10 py-12">
                <article className="max-w-4xl mx-auto px-4 md:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {isPortuguese ? 'Termos de Uso' : 'Terms of Use'}
                    </h1>
                    <p className="text-gray-400 text-sm mb-8">
                        {isPortuguese ? `Última atualização: ${lastUpdated}` : `Last updated: ${lastUpdated}`}
                    </p>

                    <div className="prose prose-invert prose-purple max-w-none space-y-8 text-gray-300">

                        {/* Aceitação */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Aceitação dos Termos</h2>
                            <p>
                                Ao acessar e utilizar a plataforma Zaya Tarot ("Plataforma"), você concorda com estes
                                Termos de Uso e nossa Política de Privacidade. Se você não concordar com qualquer
                                parte destes termos, não utilize nossos serviços.
                            </p>
                            <p>
                                A Zaya Tarot reserva-se o direito de modificar estes termos a qualquer momento.
                                Alterações significativas serão comunicadas por e-mail ou através de aviso na plataforma.
                            </p>
                        </section>

                        {/* Descrição do Serviço */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Descrição do Serviço</h2>
                            <p>A Zaya Tarot oferece:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Tiragens de tarot online com interpretações geradas por inteligência artificial</li>
                                <li>Carta do Dia personalizada com opção de recebimento via WhatsApp</li>
                                <li>Tarot por Signo com leituras específicas para cada signo zodiacal</li>
                                <li>Biblioteca de significados das cartas de tarot</li>
                                <li>Histórico de leituras realizadas</li>
                            </ul>
                        </section>

                        {/* Natureza do Serviço */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Natureza do Serviço - Aviso Importante</h2>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <p className="text-yellow-200">
                                    <strong>ATENÇÃO:</strong> As leituras de tarot oferecidas pela Zaya Tarot são exclusivamente para
                                    fins de <strong>entretenimento, reflexão pessoal e autoconhecimento</strong>.
                                </p>
                            </div>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>As interpretações <strong>não constituem</strong> aconselhamento médico, psicológico, financeiro, jurídico ou profissional</li>
                                <li>As leituras <strong>não devem</strong> substituir o acompanhamento de profissionais qualificados</li>
                                <li>Não garantimos a precisão ou aplicabilidade das interpretações à sua situação específica</li>
                                <li>Decisões importantes devem ser tomadas com base em orientação profissional adequada</li>
                                <li>Se você está passando por dificuldades emocionais, procure ajuda de um profissional de saúde mental</li>
                            </ul>
                        </section>

                        {/* Cadastro */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Cadastro e Conta</h2>
                            <h3 className="text-lg font-medium text-white mt-6 mb-3">4.1 Requisitos</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Você deve ter pelo menos 18 anos de idade</li>
                                <li>Fornecer informações verdadeiras e atualizadas</li>
                                <li>Manter a confidencialidade de sua senha</li>
                                <li>Não compartilhar sua conta com terceiros</li>
                            </ul>

                            <h3 className="text-lg font-medium text-white mt-6 mb-3">4.2 Responsabilidades</h3>
                            <p>
                                Você é responsável por todas as atividades realizadas em sua conta. Notifique-nos
                                imediatamente se suspeitar de uso não autorizado.
                            </p>
                        </section>

                        {/* Planos e Pagamentos */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Planos e Pagamentos</h2>

                            <h3 className="text-lg font-medium text-white mt-6 mb-3">5.1 Plano Gratuito</h3>
                            <p>Permite um número limitado de tiragens por período, conforme definido na plataforma.</p>

                            <h3 className="text-lg font-medium text-white mt-6 mb-3">5.2 Plano Premium</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Assinatura mensal processada via Stripe ou Mercado Pago</li>
                                <li>Tiragens ilimitadas e acesso a recursos exclusivos</li>
                                <li>Renovação automática até cancelamento</li>
                                <li>Cancelamento pode ser feito a qualquer momento através das configurações da conta</li>
                            </ul>

                            <h3 className="text-lg font-medium text-white mt-6 mb-3">5.3 Política de Reembolso</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Você pode solicitar reembolso em até 7 dias após a primeira cobrança</li>
                                <li>Após o período de 7 dias, não haverá reembolso proporcional</li>
                                <li>O cancelamento interrompe renovações futuras, mas não gera reembolso do período atual</li>
                            </ul>
                        </section>

                        {/* WhatsApp */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Serviço de WhatsApp</h2>
                            <p>Ao optar por receber a Carta do Dia via WhatsApp:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Você consente em receber mensagens diárias no número cadastrado</li>
                                <li>Seu número será utilizado exclusivamente para este fim</li>
                                <li>Você pode cancelar a qualquer momento através das configurações</li>
                                <li>Mensagens são enviadas via API oficial do WhatsApp Business</li>
                                <li>Não garantimos a entrega em caso de problemas com a operadora ou WhatsApp</li>
                            </ul>
                        </section>

                        {/* Uso da IA */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">7. Uso de Inteligência Artificial</h2>
                            <p>
                                As interpretações de tarot são geradas por modelos de inteligência artificial (Google Gemini).
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>As respostas são geradas automaticamente com base nas cartas sorteadas</li>
                                <li>A IA pode ocasionalmente gerar conteúdo impreciso ou inadequado</li>
                                <li>Não nos responsabilizamos por interpretações que não correspondam às suas expectativas</li>
                                <li>As perguntas que você faz podem ser processadas pela API do Google</li>
                            </ul>
                        </section>

                        {/* Propriedade Intelectual */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">8. Propriedade Intelectual</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>O design, código, textos e imagens da plataforma são de nossa propriedade</li>
                                <li>As imagens das cartas de tarot utilizadas são do domínio público (Rider-Waite-Smith)</li>
                                <li>Você pode compartilhar suas leituras pessoais, mas não reproduzir a plataforma</li>
                                <li>É proibido fazer engenharia reversa ou copiar funcionalidades da plataforma</li>
                            </ul>
                        </section>

                        {/* Conduta */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">9. Conduta do Usuário</h2>
                            <p>Você concorda em não:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Usar a plataforma para fins ilegais ou não autorizados</li>
                                <li>Tentar acessar áreas restritas ou hackear o sistema</li>
                                <li>Criar múltiplas contas para burlar limites do plano gratuito</li>
                                <li>Compartilhar conteúdo ofensivo, difamatório ou ilegal</li>
                                <li>Usar bots ou scripts automatizados sem autorização</li>
                                <li>Revender ou comercializar o acesso à plataforma</li>
                            </ul>
                        </section>

                        {/* Limitação de Responsabilidade */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">10. Limitação de Responsabilidade</h2>
                            <p>Na extensão máxima permitida por lei:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>A plataforma é fornecida "como está", sem garantias de qualquer tipo</li>
                                <li>Não garantimos disponibilidade ininterrupta do serviço</li>
                                <li>Não nos responsabilizamos por decisões tomadas com base nas leituras</li>
                                <li>Nossa responsabilidade total é limitada ao valor pago nos últimos 12 meses</li>
                                <li>Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais</li>
                            </ul>
                        </section>

                        {/* Suspensão */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">11. Suspensão e Encerramento</h2>
                            <p>Podemos suspender ou encerrar sua conta se você:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Violar estes Termos de Uso</li>
                                <li>Fornecer informações falsas</li>
                                <li>Realizar atividades fraudulentas</li>
                                <li>Abusar do sistema ou de outros usuários</li>
                            </ul>
                            <p className="mt-4">
                                Você pode encerrar sua conta a qualquer momento através das configurações.
                            </p>
                        </section>

                        {/* Lei Aplicável */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">12. Lei Aplicável e Foro</h2>
                            <p>
                                Estes termos são regidos pelas leis da República Federativa do Brasil.
                                Qualquer disputa será resolvida no foro da comarca de São Paulo - SP,
                                com exclusão de qualquer outro, por mais privilegiado que seja.
                            </p>
                        </section>

                        {/* Contato */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">13. Contato</h2>
                            <p>Para dúvidas sobre estes termos:</p>
                            <div className="bg-white/5 rounded-lg p-4 mt-4">
                                <p><strong>E-mail:</strong> contato@zayatarot.com</p>
                                <p><strong>Site:</strong> www.zayatarot.com</p>
                            </div>
                        </section>

                    </div>

                    {/* Botão voltar */}
                    <div className="mt-12 pt-8 border-t border-border-dark">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            {isPortuguese ? 'Voltar ao Início' : 'Back to Home'}
                        </button>
                    </div>
                </article>
            </main>
        </div>
    );
};

export default TermsOfUse;

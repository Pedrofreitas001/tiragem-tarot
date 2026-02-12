import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MinimalStarsBackground } from '../components/MinimalStarsBackground';

export const PrivacyPolicy = () => {
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
                        {isPortuguese ? 'Política de Privacidade' : 'Privacy Policy'}
                    </h1>
                    <p className="text-gray-400 text-sm mb-8">
                        {isPortuguese ? `Última atualização: ${lastUpdated}` : `Last updated: ${lastUpdated}`}
                    </p>

                    <div className="prose prose-invert prose-purple max-w-none space-y-8 text-gray-300">

                        {/* Introdução */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Introdução</h2>
                            <p>
                                A Zaya Tarot ("nós", "nosso" ou "plataforma") está comprometida com a proteção da sua privacidade.
                                Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos seus dados
                                pessoais quando você utiliza nossos serviços de leitura de tarot online.
                            </p>
                            <p>
                                Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)
                                e demais legislações aplicáveis no Brasil.
                            </p>
                        </section>

                        {/* Dados Coletados */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Dados que Coletamos</h2>

                            <h3 className="text-lg font-medium text-white mt-6 mb-3">2.1 Dados fornecidos por você</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Dados de cadastro:</strong> nome, e-mail, senha (criptografada), data de nascimento (opcional) e signo do zodíaco (opcional)</li>
                                <li><strong>Dados de pagamento:</strong> processados de forma segura pelo Stripe e Mercado Pago - não armazenamos dados de cartão de crédito</li>
                                <li><strong>Número de WhatsApp:</strong> quando você opta por receber a Carta do Dia via WhatsApp</li>
                                <li><strong>Perguntas de tarot:</strong> as perguntas que você faz durante as tiragens</li>
                            </ul>

                            <h3 className="text-lg font-medium text-white mt-6 mb-3">2.2 Dados coletados automaticamente</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Dados de uso:</strong> páginas visitadas, tiragens realizadas, histórico de leituras</li>
                                <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional, dispositivo utilizado</li>
                                <li><strong>Cookies:</strong> pequenos arquivos armazenados no seu dispositivo para melhorar sua experiência</li>
                            </ul>
                        </section>

                        {/* Como Usamos */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Como Usamos Seus Dados</h2>
                            <p>Utilizamos seus dados para as seguintes finalidades:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li><strong>Prestação do serviço:</strong> realizar tiragens de tarot personalizadas e gerar interpretações com inteligência artificial</li>
                                <li><strong>Comunicação:</strong> enviar a Carta do Dia via WhatsApp (se você optar por receber)</li>
                                <li><strong>Processamento de pagamentos:</strong> gerenciar assinaturas Premium através do Stripe</li>
                                <li><strong>Melhoria do serviço:</strong> analisar padrões de uso para aprimorar a experiência</li>
                                <li><strong>Segurança:</strong> proteger contra fraudes e acessos não autorizados</li>
                                <li><strong>Obrigações legais:</strong> cumprir exigências regulatórias e fiscais</li>
                            </ul>
                        </section>

                        {/* Bases Legais LGPD */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Bases Legais para Tratamento (LGPD)</h2>
                            <p>Tratamos seus dados pessoais com base nas seguintes hipóteses legais:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li><strong>Execução de contrato:</strong> para fornecer os serviços de tarot que você contratou</li>
                                <li><strong>Consentimento:</strong> para envio de mensagens via WhatsApp e cookies não essenciais</li>
                                <li><strong>Legítimo interesse:</strong> para melhorias do serviço e segurança da plataforma</li>
                                <li><strong>Cumprimento de obrigação legal:</strong> para atender exigências fiscais e regulatórias</li>
                            </ul>
                        </section>

                        {/* Compartilhamento */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Compartilhamento de Dados</h2>
                            <p>Compartilhamos seus dados apenas com os seguintes parceiros, estritamente para as finalidades descritas:</p>

                            <div className="mt-4 space-y-4">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h4 className="font-medium text-white">Supabase</h4>
                                    <p className="text-sm text-gray-400">Armazenamento seguro de dados de usuários e autenticação</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h4 className="font-medium text-white">Stripe</h4>
                                    <p className="text-sm text-gray-400">Processamento de pagamentos e gestão de assinaturas Premium</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h4 className="font-medium text-white">Mercado Pago</h4>
                                    <p className="text-sm text-gray-400">Processamento de pagamentos via PIX e cartão (Brasil)</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h4 className="font-medium text-white">WhatsApp (Meta)</h4>
                                    <p className="text-sm text-gray-400">Envio da Carta do Dia para usuários que optaram por receber</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h4 className="font-medium text-white">Google (Gemini AI)</h4>
                                    <p className="text-sm text-gray-400">Geração de interpretações personalizadas de tarot via IA</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h4 className="font-medium text-white">Vercel</h4>
                                    <p className="text-sm text-gray-400">Hospedagem da aplicação e infraestrutura de servidores</p>
                                </div>
                            </div>

                            <p className="mt-4">
                                <strong>Não vendemos</strong> seus dados pessoais para terceiros. Todos os parceiros listados
                                possuem políticas de privacidade próprias e estão sujeitos a obrigações contratuais de proteção de dados.
                            </p>
                        </section>

                        {/* Cookies */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Cookies e Tecnologias Similares</h2>
                            <p>Utilizamos cookies para:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li><strong>Cookies essenciais:</strong> manter sua sessão ativa e preferências de idioma</li>
                                <li><strong>Cookies de funcionalidade:</strong> lembrar suas preferências e configurações</li>
                                <li><strong>Cookies de análise:</strong> entender como você usa a plataforma para melhorá-la</li>
                            </ul>
                            <p className="mt-4">
                                Você pode gerenciar suas preferências de cookies a qualquer momento através das configurações
                                do seu navegador. Note que desabilitar cookies essenciais pode afetar o funcionamento do site.
                            </p>
                        </section>

                        {/* Seus Direitos */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">7. Seus Direitos (LGPD)</h2>
                            <p>De acordo com a LGPD, você tem os seguintes direitos:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
                                <li><strong>Correção:</strong> solicitar correção de dados incompletos ou desatualizados</li>
                                <li><strong>Anonimização ou exclusão:</strong> solicitar que seus dados sejam anonimizados ou excluídos</li>
                                <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
                                <li><strong>Revogação do consentimento:</strong> retirar seu consentimento a qualquer momento</li>
                                <li><strong>Oposição:</strong> opor-se ao tratamento em certas circunstâncias</li>
                                <li><strong>Informação:</strong> saber com quem compartilhamos seus dados</li>
                            </ul>
                            <p className="mt-4">
                                Para exercer qualquer desses direitos, entre em contato pelo e-mail: <strong>privacidade@zayatarot.com</strong>
                            </p>
                        </section>

                        {/* Retenção */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">8. Retenção de Dados</h2>
                            <p>Mantemos seus dados pelo tempo necessário para:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li><strong>Conta ativa:</strong> enquanto você mantiver sua conta na plataforma</li>
                                <li><strong>Histórico de leituras:</strong> por até 2 anos após a última atividade, para sua consulta</li>
                                <li><strong>Dados de pagamento:</strong> conforme exigido pela legislação fiscal (5 anos)</li>
                                <li><strong>Após exclusão da conta:</strong> dados anonimizados podem ser mantidos para estatísticas</li>
                            </ul>
                        </section>

                        {/* Segurança */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">9. Segurança dos Dados</h2>
                            <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                                <li>Criptografia de senhas (bcrypt)</li>
                                <li>Autenticação segura via Supabase Auth</li>
                                <li>Acesso restrito aos dados por funcionários autorizados</li>
                                <li>Monitoramento contínuo de segurança</li>
                            </ul>
                        </section>

                        {/* Menores */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">10. Menores de Idade</h2>
                            <p>
                                Nossos serviços são destinados a pessoas maiores de 18 anos. Não coletamos intencionalmente
                                dados de menores de idade. Se você é responsável por um menor e acredita que ele forneceu
                                dados pessoais, entre em contato conosco para que possamos excluí-los.
                            </p>
                        </section>

                        {/* Alterações */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">11. Alterações nesta Política</h2>
                            <p>
                                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre
                                mudanças significativas por e-mail ou através de um aviso na plataforma. Recomendamos
                                revisar esta página regularmente.
                            </p>
                        </section>

                        {/* Contato */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">12. Contato</h2>
                            <p>Para dúvidas sobre esta política ou sobre o tratamento dos seus dados:</p>
                            <div className="bg-white/5 rounded-lg p-4 mt-4">
                                <p><strong>E-mail:</strong> privacidade@zayatarot.com</p>
                                <p><strong>Encarregado de Dados (DPO):</strong> dpo@zayatarot.com</p>
                            </div>
                        </section>

                        {/* Autoridade */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">13. Autoridade Nacional de Proteção de Dados</h2>
                            <p>
                                Se você não estiver satisfeito com nossa resposta ou tratamento dos seus dados,
                                você tem o direito de apresentar uma reclamação à Autoridade Nacional de Proteção de Dados (ANPD):
                            </p>
                            <div className="bg-white/5 rounded-lg p-4 mt-4">
                                <p><strong>Site:</strong> www.gov.br/anpd</p>
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

export default PrivacyPolicy;
